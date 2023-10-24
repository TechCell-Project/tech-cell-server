import { Controller, Inject, UseGuards, Post, Body, HttpCode } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ORDER_SERVICE } from '@app/common/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckoutMessagePattern } from '~apps/order/checkout-ord/checkout.pattern';
import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import { ReviewOrderRequestDTO, ReviewOrderResponseDTO } from '~apps/order/checkout-ord/dtos';

@UseGuards(AuthGuard)
@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @ApiResponse({ status: 200, description: 'Review order', type: ReviewOrderResponseDTO })
    @HttpCode(200)
    @Post('')
    async createOrder(
        @CurrentUser() user: TCurrentUser,
        @Body() dataReview: ReviewOrderRequestDTO,
    ) {
        return this.orderService
            .send(CheckoutMessagePattern.createOrder, { user, dataReview })
            .pipe(catchException());
    }

    @ApiResponse({ status: 200, description: 'Review order', type: ReviewOrderResponseDTO })
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
}
