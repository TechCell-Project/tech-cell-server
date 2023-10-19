import { Controller, Inject, Get, Query, Post, Body, Patch, Param } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '@app/common/constants';
import { catchException } from '@app/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import {
    CategoriesSearchMessagePattern,
    GetCategoriesRequestDTO,
    GetCategoryByLabelRequestDTO,
} from '~/apps/search/categories-search';
import {
    CategoriesMntMessagePattern,
    CreateCategoryRequestDTO,
    UpdateCategoryRequestDTO,
} from '~/apps/managements/categories-mnt';
import { CategoryIdParam } from '@app/resource/categories/dtos';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Get list of categories',
        description: 'Get list of categories',
    })
    @ApiOkResponse({ description: 'Get categories successfully!' })
    @ApiNotFoundResponse({ description: 'Categories not found!' })
    @Get('/')
    async getCategories(@Query() query: GetCategoriesRequestDTO) {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategories, { ...query })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get category by id',
        description: 'Get category by id',
    })
    @ApiOkResponse({ description: 'Get category successfully!' })
    @ApiNotFoundResponse({ description: 'Category not found!' })
    @Get(':categoryId')
    async getCategoryById(@Param() { categoryId }: CategoryIdParam) {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategoryById, { categoryId })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get category by label',
        description: 'Get category by label',
    })
    @ApiOkResponse({ description: 'Get category successfully!' })
    @ApiNotFoundResponse({ description: 'Category not found!' })
    @Get('/label/:label')
    async getCategoryByLabel(@Param() { label }: GetCategoryByLabelRequestDTO) {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategoryByLabel, { label })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Create category',
        description: 'Create category',
    })
    @ApiCreatedResponse({ description: 'The category has been successfully created.' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @Post('/')
    async createCategories(@Body() data: CreateCategoryRequestDTO) {
        return this.managementsService
            .send(CategoriesMntMessagePattern.createCategory, { ...data })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update category',
        description: 'Update category',
    })
    @Patch('/:categoryId')
    async updateCategory(
        @Param() { categoryId }: CategoryIdParam,
        @Body() data: UpdateCategoryRequestDTO,
    ) {
        return this.managementsService
            .send(CategoriesMntMessagePattern.updateCategory, { categoryId, ...data })
            .pipe(catchException());
    }
}
