import { MongodbModule } from '@app/common';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { RedisModule } from '@app/common/Redis';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([
            {
                name: Order.name,
                schema: OrderSchema,
            },
        ]),
        RedisModule.register({
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
        }),
    ],
    providers: [OrderRepository, OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
