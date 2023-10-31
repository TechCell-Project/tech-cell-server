import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CartsOrdModule } from '~apps/order/carts-ord';
import { CheckoutModule } from './checkout-ord/checkout.module';
import { OrderController } from './order.controller';
import { OrderHealthIndicator } from './order.health';

@Module({
    imports: [AppConfigModule, CartsOrdModule, CheckoutModule],
    controllers: [OrderController],
    providers: [RabbitMQService, OrderHealthIndicator],
})
export class OrderModule {}
