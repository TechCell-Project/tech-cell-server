import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderStatusEnum, OrdersService, PaymentMethodEnum } from '~libs/resource/orders';
import { GetOrdersRequestDTO } from './dtos/get-orders-request.dto';
import { convertPageQueryToMongoose, convertToObjectId } from '~libs/common/utils';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { AllEnum } from '~libs/common/base/enums';
import { Product, ProductsService } from '~libs/resource';
import { COMMUNICATIONS_SERVICE } from '~libs/common/constants/services.constant';
import { ClientRMQ } from '@nestjs/microservices';
import { NotifyEventPattern } from '~apps/communications/notifications';
import { SelectType } from '~apps/search/enums/select-type.enum';
import { OrderByEnum, OrderTypeEnum } from './enums';

@Injectable()
export class OrdersMntService {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
        @Inject(COMMUNICATIONS_SERVICE) protected communicationsService: ClientRMQ,
    ) {}

    async getOrder(orderId: Types.ObjectId) {
        const order = await this.ordersService.getOrderById(orderId);
        const products = await Promise.all(
            order.products.map((prod) =>
                this.productsService.getProduct({
                    filterQueries: {
                        _id: convertToObjectId(prod.productId),
                    },
                    selectType: SelectType.both,
                }),
            ),
        );

        const mapProducts = products.reduce((map, product) => {
            map[product._id.toString()] = product;
            return map;
        }, {});

        order.products.forEach((productInOrder) => {
            const foundProduct: Product = mapProducts[productInOrder.productId.toString()];
            const foundProductVariant = foundProduct.variations.find(
                (variant) => variant.sku === productInOrder.sku,
            );

            if (foundProduct) {
                Object.assign(productInOrder, {
                    name: foundProduct.name,
                    generalImages: foundProduct.generalImages,
                    ...(foundProductVariant ?? {}),
                });
            }
        });

        return order;
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
            orderBy = OrderByEnum.createdAt,
            orderType = OrderTypeEnum.newest,
        } = data;
        const filter: FilterQuery<Order> = {};

        if (trackingCode) {
            filter.trackingCode = trackingCode;
        }

        if (orderId) {
            filter._id = convertToObjectId(orderId);
        }

        if (userId) {
            filter.userId = convertToObjectId(userId);
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

        const queryOptions: QueryOptions = {
            ...convertPageQueryToMongoose({ page, pageSize }),
        };

        if (orderType) {
            switch (orderType) {
                case OrderTypeEnum.oldest:
                    Object.assign(queryOptions, { sort: { [orderBy]: 'ascending' } });
                    break;
                case OrderTypeEnum.newest:
                default:
                    Object.assign(queryOptions, { sort: { [orderBy]: 'descending' } });
                    break;
            }
        }

        const [orders, totalRecord] = await Promise.all([
            this.ordersService.getOrders(filter, queryOptions),
            this.ordersService.countOrders(filter),
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

        if (
            order?.paymentOrder.method === PaymentMethodEnum.COD &&
            orderStatus === OrderStatusEnum.COMPLETED
        ) {
            order.paymentOrder.status = OrderStatusEnum.COMPLETED;
        }

        order.orderStatus = orderStatus;
        const orderUpdated = await this.ordersService.updateOrderById(orderId, order);
        this.communicationsService.emit(NotifyEventPattern.orderStatusChanged, { order });
        return orderUpdated;
    }
}
