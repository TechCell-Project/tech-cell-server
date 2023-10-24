import { Injectable } from '@nestjs/common';
import { OrderRepository } from './orders.repository';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { ClientSession } from 'mongoose';

@Injectable()
export class OrdersService {
    constructor(private readonly orderRepository: OrderRepository) {}

    async createOrder(data: CreateOrderDTO, session?: ClientSession) {
        return this.orderRepository.create(data, {}, session);
    }

    async startTransaction() {
        return this.orderRepository.startTransaction();
    }
}
