import { AbstractRepository } from '@app/resource/abstract';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrderRepository extends AbstractRepository<Order> {
    protected readonly logger = new Logger(OrderRepository.name);

    constructor(
        @InjectModel(Order.name) orderModel: Model<Order>,
        @InjectConnection() connection: Connection,
    ) {
        super(orderModel, connection);
    }
}
