import { Controller, Inject, Get, Request } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesSearchMessagePattern } from '~/apps/search/categories-search';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(@Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ) {}

    @Get('/')
    async getCategories() {
        return this.searchService
            .send(CategoriesSearchMessagePattern.getCategories, {})
            .pipe(catchException());
    }
}
