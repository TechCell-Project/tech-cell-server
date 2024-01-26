import { Module } from '@nestjs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { OrdersMntController } from './orders-mnt.controller';
import { OrdersMntService } from './orders-mnt.service';
import { OrdersModule } from '~libs/resource/orders';
import { ProductsModule } from '~libs/resource';
import { COMMUNICATIONS_SERVICE } from '~libs/common';
import { RabbitMQModule } from '~libs/common/RabbitMQ';

@Module({
    imports: [
        OrdersModule,
        ProductsModule,
        RabbitMQModule.registerRmq(
            COMMUNICATIONS_SERVICE,
            process.env.RABBITMQ_COMMUNICATIONS_QUEUE,
        ),
    ],
    controllers: [OrdersMntController],
    providers: [RabbitMQService, OrdersMntService],
})
export class OrdersMntModule {}
