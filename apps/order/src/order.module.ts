import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { PaymentModule } from '@app/payment';
import { CartsOrdModule } from '~/apps/order/carts-ord';
import { GhtkModule } from '@app/third-party/giaohangtietkiem.vn';
import { CheckoutModule } from './checkout-ord/checkout.module';

@Module({
    imports: [AppConfigModule, PaymentModule, CartsOrdModule, GhtkModule, CheckoutModule],
    providers: [RabbitMQService],
})
export class OrderModule {}
