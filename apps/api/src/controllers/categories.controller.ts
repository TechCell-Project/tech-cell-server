import { Controller, Inject, Get, Query, Post, Body, Patch, Param } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    CategoriesSearchMessagePattern,
    GetCategoriesRequestDTO,
} from '~/apps/search/categories-search';
import {
    CategoriesMntMessagePattern,
    CreateCategoryRequestDTO,
    UpdateCategoryRequestDTO,
} from '~/apps/managements/categories-mnt';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @ApiOkResponse({ description: 'Get categories successfully!' })
    @ApiNotFoundResponse({ description: 'Categories not found!' })
    @Get('/')
    async getCategories(@Query() query: GetCategoriesRequestDTO) {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategories, { ...query })
            .pipe(catchException());
    }

    @ApiCreatedResponse({ description: 'The category has been successfully created.' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @Post('/')
    async createCategories(@Body() data: CreateCategoryRequestDTO) {
        return this.managementsService
            .send(CategoriesMntMessagePattern.createCategory, { ...data })
            .pipe(catchException());
    }

    @Patch('/:categoryId')
    async updateCategory(
        @Param('categoryId') categoryId: string,
        @Body() data: UpdateCategoryRequestDTO,
    ) {
        return this.managementsService
            .send(CategoriesMntMessagePattern.updateCategory, { categoryId, ...data })
            .pipe(catchException());
    }
}
