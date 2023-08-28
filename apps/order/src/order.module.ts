import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { PaymentModule } from '@app/payment';

@Module({
    imports: [AppConfigModule, PaymentModule],
    controllers: [OrderController],
    providers: [OrderService, RabbitMQService],
})
export class OrderModule {}
