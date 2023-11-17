import { Module } from '@nestjs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { OrdersMntController } from './orders-mnt.controller';
import { OrdersMntService } from './orders-mnt.service';
import { OrdersModule } from '~libs/resource/orders';

@Module({
    imports: [OrdersModule],
    controllers: [OrdersMntController],
    providers: [RabbitMQService, OrdersMntService],
})
export class OrdersMntModule {}
