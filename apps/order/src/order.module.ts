import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CartsOrdModule } from '~apps/order/carts-ord';
import { CheckoutModule } from './checkout-ord/checkout.module';
import { OrderController } from './order.controller';
import { OrderHealthIndicator } from './order.health';
import { I18nModule } from '~libs/common/i18n/i18n.module';

@Module({
    imports: [AppConfigModule, I18nModule, CartsOrdModule, CheckoutModule],
    controllers: [OrderController],
    providers: [RabbitMQService, OrderHealthIndicator],
})
export class OrderModule {}
