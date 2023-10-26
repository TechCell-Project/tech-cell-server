import { Injectable } from '@nestjs/common';
import { OrderRepository } from './orders.repository';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { ClientSession, Types } from 'mongoose';
import { Order } from './schemas';

@Injectable()
export class OrdersService {
    constructor(private readonly orderRepository: OrderRepository) {}

    async createOrder(data: CreateOrderDTO, session?: ClientSession) {
        return this.orderRepository.create(data, {}, session);
    }

    async startTransaction() {
        return this.orderRepository.startTransaction();
    }

    async getOrderById(id: Types.ObjectId) {
        return this.orderRepository.findOne({
            _id: id,
        });
    }

    async getOrderByIdOrNull(id: Types.ObjectId) {
        try {
            const order = await this.orderRepository.findOne({
                _id: id,
            });
            return order;
        } catch (error) {
            return null;
        }
    }

    async updateOrderById(id: Types.ObjectId, data: Partial<Order>) {
        return this.orderRepository.updateOne(
            {
                _id: id,
            },
            {
                $set: data,
            },
        );
    }
}
