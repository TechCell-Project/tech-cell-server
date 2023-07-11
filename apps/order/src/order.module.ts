import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule, RabbitMQService } from '@app/common';
import { PaymentModule } from '@app/payment';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        RabbitMQModule,
        PaymentModule,
    ],
    controllers: [OrderController],
    providers: [OrderService, RabbitMQService],
})
export class OrderModule {}
