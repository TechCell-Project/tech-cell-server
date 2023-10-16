import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { PaginationQuery } from '@app/common/dtos';
import { TCurrentUser } from '@app/common/types';
import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartsOrdMessagePattern, AddCartRequestDTO } from '~/apps/order/carts-ord';
import { ACCESS_TOKEN_NAME } from '~/constants/api.constant';
import { ORDER_SERVICE } from '~/constants/services.constant';

@ApiTags('carts')
@Controller('carts')
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@UseGuards(AuthGuard)
export class CartsController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @ApiOperation({
        summary: 'Get list of carts',
        description: 'Get list of carts',
    })
    @ApiOkResponse({ description: 'Carts found!' })
    @Get('/')
    async getCarts(@Query() query: PaginationQuery, @CurrentUser() user: TCurrentUser) {
        return this.orderService
            .send(CartsOrdMessagePattern.getCarts, { query, user })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Add cart',
        description: 'Add cart',
    })
    @ApiOkResponse({ description: 'Cart updated!' })
    @HttpCode(200)
    @Post('/')
    async addCart(@Body() { ...cartData }: AddCartRequestDTO, @CurrentUser() user: TCurrentUser) {
        return this.orderService
            .send(CartsOrdMessagePattern.addCart, { cartData, user })
            .pipe(catchException());
    }
}
