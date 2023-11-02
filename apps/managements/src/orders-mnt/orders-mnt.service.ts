import { Injectable } from '@nestjs/common';
import { Order, OrdersService } from '@app/resource/orders';
import { GetOrdersRequestDTO } from './dtos/get-orders-request.dto';
import { convertPageQueryToMongoose } from '@app/common/utils';
import { FilterQuery, Types } from 'mongoose';
import { ListDataResponseDTO } from '@app/common/dtos';
import { AllEnum } from '@app/common/base/enums';

@Injectable()
export class OrdersMntService {
    constructor(private readonly ordersService: OrdersService) {}

    async getOrder(orderId: Types.ObjectId) {
        return await this.ordersService.getOrderById(orderId);
    }

    async getOrders(data: GetOrdersRequestDTO) {
        const {
            page,
            pageSize,
            orderId,
            userId,
            productId,
            orderStatus,
            paymentMethod,
            paymentStatus,
            trackingCode,
        } = data;
        const filter: FilterQuery<Order> = {};

        if (trackingCode) {
            filter.trackingCode = trackingCode;
        }

        if (orderId) {
            filter._id = new Types.ObjectId(orderId);
        }

        if (userId) {
            filter.userId = new Types.ObjectId(userId);
        }

        if (productId) {
            filter.products = {
                $elemMatch: {
                    productId: productId,
                },
            };
        }

        if (orderStatus && orderStatus !== AllEnum.all) {
            filter.orderStatus = orderStatus;
        }

        if (paymentMethod && paymentMethod !== AllEnum.all) {
            Object.assign(filter, { 'paymentOrder.method': paymentMethod });
        }

        if (paymentStatus && paymentStatus !== AllEnum.all) {
            Object.assign(filter, { 'paymentOrder.status': paymentStatus });
        }

        const queryOptions = {
            ...convertPageQueryToMongoose({ page, pageSize }),
        };

        const [orders, totalRecord] = await Promise.all([
            this.ordersService.getOrders({ ...filter }, queryOptions),
            this.ordersService.countOrders({ ...filter }),
        ]);
        const totalPage = Math.ceil(totalRecord / pageSize);
        return new ListDataResponseDTO<Order>({
            page,
            pageSize,
            totalPage,
            totalRecord,
            data: orders,
        });
    }

    async updateOrderStatus(orderId: Types.ObjectId, orderStatus: string) {
        const order = await this.ordersService.getOrderById(orderId);
        order.orderStatus = orderStatus;
        const orderUpdated = await this.ordersService.updateOrderById(orderId, order);
        return orderUpdated;
    }
}
