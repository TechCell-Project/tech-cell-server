import { Controller, Inject, UseGuards, Post, Body, HttpCode, Get, Query } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ORDER_SERVICE } from '@app/common/constants';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckoutMessagePattern } from '~apps/order/checkout-ord/checkout.pattern';
import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import {
    ReviewOrderRequestDTO,
    ReviewOrderResponseDTO,
    VnpayIpnUrlDTO,
} from '~apps/order/checkout-ord/dtos';
import { CreateOrderRequestDTO } from '~apps/order/checkout-ord/dtos/create-order-request.dto';
import { OrderSchemaDTO } from '@app/resource/orders/dtos/order-schema.dto';

@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @UseGuards(AuthGuard)
    @ApiResponse({ description: 'Get all user orders', type: [OrderSchemaDTO] })
    @Get('/')
    async getAllUserOrders(@CurrentUser() user: TCurrentUser) {
        return this.orderService
            .send(CheckoutMessagePattern.getAllUserOrders, { user })
            .pipe(catchException());
    }

    @UseGuards(AuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Review order before create (for getting the shipping fee, etc...)',
        type: ReviewOrderResponseDTO,
    })
    @HttpCode(200)
    @Post('/review')
    async reviewOrder(
        @CurrentUser() user: TCurrentUser,
        @Body() dataReview: ReviewOrderRequestDTO,
    ) {
        return this.orderService
            .send(CheckoutMessagePattern.reviewOrder, { user, dataReview })
            .pipe(catchException());
    }

    @UseGuards(AuthGuard)
    @ApiResponse({ status: 200, description: 'Review order', type: OrderSchemaDTO })
    @HttpCode(200)
    @Post('/')
    async createOrder(
        @CurrentUser() user: TCurrentUser,
        @Body() data2CreateOrder: CreateOrderRequestDTO,
    ) {
        return this.orderService
            .send(CheckoutMessagePattern.createOrder, { user, data2CreateOrder })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @Get('/vnpay-ipn')
    async vnpayIpnUrl(@Query() { ...query }: VnpayIpnUrlDTO) {
        return this.orderService
            .send(CheckoutMessagePattern.vnpayIpnUrl, { ...query })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @Get('/vnpay-return')
    async vnpayReturnUrl(@Query() { ...query }: VnpayIpnUrlDTO) {
        return this.orderService
            .send(CheckoutMessagePattern.vnpayReturnUrl, { ...query })
            .pipe(catchException());
    }
}
