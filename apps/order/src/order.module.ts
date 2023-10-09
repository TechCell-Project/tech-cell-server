import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CartsOrdModule } from '~/apps/order/carts-ord';
import { GhtkModule } from '@app/third-party/giaohangtietkiem.vn';
import { VnpayModule } from '@app/third-party/vnpay';
import { CheckoutModule } from './checkout-ord/checkout.module';

@Module({
    imports: [AppConfigModule, VnpayModule, CartsOrdModule, GhtkModule, CheckoutModule],
    providers: [RabbitMQService],
})
export class OrderModule {}
