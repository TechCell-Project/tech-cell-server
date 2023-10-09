import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CartsOrdModule } from '~/apps/order/carts-ord';
import { VnpayModule } from '@app/third-party/vnpay.vn';
import { CheckoutModule } from './checkout-ord/checkout.module';

@Module({
    imports: [AppConfigModule, VnpayModule, CartsOrdModule, CheckoutModule],
    providers: [RabbitMQService],
})
export class OrderModule {}
