import { Controller, Inject, Get, Query, Post, Body } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import {
    CategoriesSearchMessagePattern,
    GetCategoriesRequestDTO,
} from '~/apps/search/categories-search';
import {
    CategoriesMntMessagePattern,
    CreateCategoryRequestDTO,
} from '~/apps/managements/categories-mnt';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @Get('/')
    async getCategories(@Query() query: GetCategoriesRequestDTO) {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategories, { ...query })
            .pipe(catchException());
    }

    @Post('/')
    async createCategories(@Body() data: CreateCategoryRequestDTO) {
        return this.managementsService
            .send(CategoriesMntMessagePattern.createCategory, { ...data })
            .pipe(catchException());
    }
}
