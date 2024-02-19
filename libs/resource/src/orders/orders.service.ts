import { Injectable } from '@nestjs/common';
import { OrderRepository } from './orders.repository';
import { CreateOrderDTO } from './dtos/create-order.dto';
import {
    ClientSession,
    FilterQuery,
    ProjectionType,
    QueryOptions,
    Types,
    UpdateQuery,
} from 'mongoose';
import { Order } from './schemas';
import { RedlockService } from '~libs/common/Redis/services';
import { convertToObjectId } from '~libs/common';

@Injectable()
export class OrdersService {
    protected readonly UPDATE_ORDER_LOCK_KEY_PREFIX = 'update_order';

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly redLock: RedlockService,
    ) {}

    async createOrder(data: CreateOrderDTO, session?: ClientSession) {
        return this.orderRepository.create(data, {}, session);
    }

    async getOrder({
        filter,
        projection,
        queryOptions,
        session,
    }: {
        filter: FilterQuery<Order>;
        queryOptions?: QueryOptions<Order>;
        projection?: ProjectionType<Order>;
        session?: ClientSession;
    }) {
        return this.orderRepository.findOne({
            filterQuery: filter,
            ...(queryOptions ?? {}),
            projection,
            session,
        });
    }

    async getOrders(
        filter: FilterQuery<Order>,
        queryOptions?: QueryOptions<Order>,
        projection?: ProjectionType<Order>,
    ) {
        return this.orderRepository.find({
            filterQuery: filter,
            queryOptions: queryOptions,
            projection: projection,
        });
    }

    async getOrdersOrNull(
        filter: FilterQuery<Order>,
        queryOptions?: QueryOptions<Order>,
        projection?: ProjectionType<Order>,
    ): Promise<Order[] | null> {
        try {
            const result = await this.orderRepository.find({
                filterQuery: filter,
                queryOptions: queryOptions,
                projection: projection,
            });
            return result;
        } catch (error) {
            return null;
        }
    }

    async countOrders(filter: FilterQuery<Order>) {
        return this.orderRepository.count(filter);
    }

    async startTransaction() {
        return this.orderRepository.startTransaction();
    }

    async getOrderById(id: Types.ObjectId) {
        return this.orderRepository.findOne({
            _id: convertToObjectId(id),
        });
    }

    async getOrderByIdPopulate(id: Types.ObjectId) {
        return this.orderRepository.findOne(
            {
                _id: convertToObjectId(id),
            },
            { lean: false },
        );
    }

    async getOrderByIdOrNull(id: Types.ObjectId) {
        try {
            const order = await this.orderRepository.findOne({
                _id: convertToObjectId(id),
            });
            return order;
        } catch (error) {
            return null;
        }
    }

    async getUserOrderById(orderId: Types.ObjectId, userId: Types.ObjectId) {
        return this.orderRepository.findOne({
            _id: convertToObjectId(orderId),
            userId: convertToObjectId(userId),
        });
    }

    async updateOrderById(
        orderId: Types.ObjectId,
        dataUpdate: UpdateQuery<Order>,
        session?: ClientSession,
    ) {
        if (!orderId) throw new Error('Order id is required');
        const lockKey = `${this.UPDATE_ORDER_LOCK_KEY_PREFIX}:${orderId?.toString()}`;
        const lock = await this.redLock.lock([lockKey], 1000);
        let result: Order;
        try {
            result = await this.orderRepository.findOneAndUpdate(
                {
                    _id: convertToObjectId(orderId),
                },
                dataUpdate,
                null,
                session,
            );
        } finally {
            await this.redLock.unlock(lock);
        }

        return result;
    }

    async getAllUserOrders(userId: Types.ObjectId, options?: QueryOptions<Order>) {
        return this.orderRepository.find({
            filterQuery: {
                userId: convertToObjectId(userId),
            },
            queryOptions: {
                sort: {
                    updatedAt: -1,
                },
                ...options,
            },
        });
    }
}
