import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CartsOrdModule } from '~apps/order/carts-ord';
import { CheckoutModule } from './checkout-ord/checkout.module';

@Module({
    imports: [AppConfigModule, CartsOrdModule, CheckoutModule],
    providers: [RabbitMQService],
})
export class OrderModule {}
