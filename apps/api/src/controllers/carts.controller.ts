import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { PaginationQuery } from '@app/common/dtos';
import { TCurrentUser } from '@app/common/types';
import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartsMntMessagePattern } from '~/apps/managements/carts-mnt';
import { AddCartRequestDTO } from '~/apps/managements/carts-mnt/dtos/create-cart-request.dto';
import { CartsSearchMessagePattern } from '~/apps/search/carts-search/carts-search.pattern';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants/services.constant';

@ApiTags('carts')
@Controller('carts')
@UseGuards(AuthGuard)
export class CartsController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @Get('/')
    async getCarts(@Query() query: PaginationQuery, @CurrentUser() user: TCurrentUser) {
        return this.searchService
            .send(CartsSearchMessagePattern.getCarts, { ...query, userId: user._id })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Cart updated!' })
    @HttpCode(200)
    @Post('/')
    async addCart(@Body() { ...cartData }: AddCartRequestDTO, @CurrentUser() user: TCurrentUser) {
        return this.managementsService
            .send(CartsMntMessagePattern.addCart, { ...cartData, userId: user._id })
            .pipe(catchException());
    }
}
