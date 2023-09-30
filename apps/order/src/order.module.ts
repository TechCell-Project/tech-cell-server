import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { PaymentModule } from '@app/payment';
import { CartsOrdModule } from '~/apps/order/carts';

@Module({
    imports: [AppConfigModule, PaymentModule, CartsOrdModule],
    controllers: [OrderController],
    providers: [OrderService, RabbitMQService],
})
export class OrderModule {}
