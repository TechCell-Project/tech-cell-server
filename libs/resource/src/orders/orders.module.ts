import { MongodbModule } from '@app/common';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([
            {
                name: Order.name,
                schema: OrderSchema,
            },
        ]),
    ],
    providers: [OrderRepository, OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
