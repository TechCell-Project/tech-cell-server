import { Controller, Inject, Get, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ORDER_SERVICE } from '@app/common/constants';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { CheckoutMessagePattern } from '~/apps/order/checkout-ord/checkout.pattern';
import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';

@UseGuards(AuthGuard)
@ApiExcludeController()
@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @Get('/')
    async calculateShippingFee(@CurrentUser() user: TCurrentUser) {
        return this.orderService
            .send(CheckoutMessagePattern.calculateShippingFee, { user })
            .pipe(catchException());
    }
}
