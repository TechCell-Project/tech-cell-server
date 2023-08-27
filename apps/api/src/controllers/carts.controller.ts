import { catchException } from '@app/common';
import { PaginationQuery } from '@app/common/dtos';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { CartsSearchMessagePattern } from '~/apps/search/carts-search/carts-search.pattern';
import { SEARCH_SERVICE } from '~/constants';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
    constructor(@Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ) {}

    @Get('/')
    async getCarts(@Query() query: PaginationQuery) {
        return this.searchService
            .send(CartsSearchMessagePattern.getCarts, { ...query })
            .pipe(catchException());
    }
}
