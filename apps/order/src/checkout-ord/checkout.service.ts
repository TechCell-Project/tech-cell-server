import { TCurrentUser } from '~libs/common/types';
import { UsersService } from '~libs/resource/users';
import { GhnService, ItemShipping } from '~libs/third-party/giaohangnhanh';
import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { ClientSession, FilterQuery, Types, QueryOptions } from 'mongoose';
import {
    GetUserOrdersRequestDTO,
    ReviewOrderRequestDTO,
    ReviewedOrderResponseDTO,
    VnpayIpnUrlDTO,
    CreateOrderRequestDTO,
    ResponseForVnpayDTO,
} from './dtos';
import { Product, ProductsService } from '~libs/resource';
import { TProductDimensions } from './types';
import { AddressSchema, cleanUserBeforeResponse } from '~libs/resource/users';
import {
    Order,
    OrdersService,
    CreateOrderDTO,
    OrderStatusEnum,
    PaymentMethodEnum,
    PaymentStatusEnum,
} from '~libs/resource/orders';
import { CartsService, ProductCartDTO } from '~libs/resource/carts';
import { RedlockService } from '~libs/common/Redis/services/redlock.service';
import { VnpayService, ProductCode } from '~libs/third-party/vnpay.vn';
import { NotifyEventPattern } from '~apps/communications/notifications';
import { Lock } from 'redlock';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';
import {
    convertPageQueryToMongoose,
    convertToObjectId,
    COMMUNICATIONS_SERVICE,
} from '~libs/common';
import { ListDataResponseDTO, ObjectIdParamDTO, PaginationQuery } from '~libs/common/dtos';
import {
    IpnSuccess,
    IpnInvalidAmount,
    IpnFailChecksum,
    IpnOrderNotFound,
    IpnUnknownError,
    InpOrderAlreadyConfirmed,
    IpnResponse,
} from 'vnpay';

@Injectable()
export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);
    constructor(
        private readonly ghnService: GhnService,
        private readonly vnpayService: VnpayService,
        private readonly userService: UsersService,
        private readonly productService: ProductsService,
        private readonly orderService: OrdersService,
        private readonly cartService: CartsService,
        private readonly redlockService: RedlockService,
        @Inject(COMMUNICATIONS_SERVICE) private readonly communicationsService: ClientRMQ,
        @I18n() protected readonly i18n: I18nService<I18nTranslations>,
    ) {}

    /**
     * Review order before create (for getting the shipping fee, etc...)
     */
    public async reviewOrder({
        user,
        dataReview,
    }: {
        user: TCurrentUser;
        dataReview: ReviewOrderRequestDTO;
    }): Promise<ReviewedOrderResponseDTO> {
        const { addressSelected: addressIndex, productSelected } = dataReview;

        // Get user address for shipping
        const userAddress = (
            await this.userService.getUser({
                _id: convertToObjectId(user._id),
            })
        ).address;
        if (!userAddress) {
            throw new RpcException(new BadRequestException('User has no address'));
        }
        const addressSelected = userAddress[addressIndex];
        if (!addressSelected) {
            throw new RpcException(new BadRequestException('Address not found'));
        }

        // One product can have many sku, so we need to get product info to get sku
        const productIdSet = new Set(
            productSelected.map((product) => product.productId.toString()),
        );

        // Get product info as array
        const products = await Promise.all(
            Array.from(productIdSet).map((productId) =>
                this.productService.getProduct({
                    filterQueries: { _id: convertToObjectId(productId) },
                }),
            ),
        );

        // Map product info to easily get product info by productId
        const productsMap = new Map(products.map((product) => [product._id.toString(), product]));

        const listItemShipping: ItemShipping[] = productSelected.map((productUserSelected) => {
            const productInfo = productsMap.get(productUserSelected.productId.toString());

            const productWithSku = productInfo.variations.find(
                (p) => p.sku === productUserSelected.sku,
            );

            if (!productWithSku) {
                throw new RpcException(
                    new BadRequestException(
                        `Product with sku not found in product info: '${productUserSelected.sku}'`,
                    ),
                );
            }

            if (productWithSku.status < 0) {
                throw new RpcException(
                    new BadRequestException(
                        `Product with sku '${productUserSelected.sku}' is not available`,
                    ),
                );
            }

            if (productWithSku.stock < productUserSelected.quantity) {
                throw new RpcException(
                    new BadRequestException(
                        `Product with sku '${productUserSelected.sku}' is out of stock, remaining: ${productWithSku.stock}`,
                    ),
                );
            }

            const dimensions = this.getDimensions(productInfo);
            const item = new ItemShipping({
                name: productInfo.name,
                code: productWithSku.sku,
                weight: dimensions.weight,
                length: dimensions.length,
                width: dimensions.width,
                height: dimensions.height,
                quantity: productUserSelected.quantity,
            });

            return item;
        });

        const totalProductPrice = productSelected.reduce((total, productUserSelected) => {
            const productInfo = productsMap.get(productUserSelected.productId.toString());

            const productWithSku = productInfo.variations.find(
                (p) => p.sku === productUserSelected.sku,
            );

            if (!productWithSku) {
                throw new RpcException(
                    new BadRequestException(
                        `Product with sku not found in product info: '${productUserSelected.sku}'`,
                    ),
                );
            }

            productUserSelected.productId = convertToObjectId(productUserSelected.productId);
            const price = productWithSku.price.base;
            return total + price * productUserSelected.quantity;
        }, 0);

        const { total, service_fee } = await this.ghnService.calculateShippingFee({
            address: addressSelected,
            items: listItemShipping,
        });
        const giaohangnhanh = { total, service_fee };

        return new ReviewedOrderResponseDTO({
            paymentMethod: dataReview.paymentMethod,
            addressSelected: dataReview.addressSelected,
            productSelected,
            totalProductPrice,
            shipping: { giaohangnhanh },
        });
    }

    /**
     * @description Create order
     */
    public async createOrder({
        user,
        data2CreateOrder,
        ip,
    }: {
        user: TCurrentUser;
        data2CreateOrder: CreateOrderRequestDTO;
        ip: string;
    }) {
        this.validatePayment(data2CreateOrder);
        const reviewedOrder = await this.reviewOrder({ user, dataReview: data2CreateOrder });

        const resources = [];
        resources.push(`order_create:user:${user._id}`);

        // Get a set of product id, and lock theses product
        Array.from(
            new Set(reviewedOrder.productSelected.map((productCart) => productCart.productId)),
        ).forEach((productId) => {
            resources.push(`order_create:product:${productId}`);
        });

        // Get buyer info
        const userFound = await this.userService.getUser({
            _id: convertToObjectId(user._id),
        });

        // Build a new order data
        const newOrder = new CreateOrderDTO({
            _id: new Types.ObjectId(),
            userId: convertToObjectId(userFound._id),
            shippingOrder: {
                toAddress: userFound.address[reviewedOrder.addressSelected],
            },
            checkoutOrder: {
                shippingFee: reviewedOrder.shipping.giaohangnhanh.total,
                totalApplyDiscount: 0,
                totalPrice:
                    reviewedOrder.totalProductPrice + reviewedOrder.shipping.giaohangnhanh.total,
            },
            products: reviewedOrder.productSelected,
            trackingCode: this.createTrackingCode(userFound.address[reviewedOrder.addressSelected]),
            paymentOrder: {
                method: data2CreateOrder.paymentMethod,
                status:
                    data2CreateOrder.paymentMethod === PaymentMethodEnum.COD
                        ? PaymentStatusEnum.PROCESSING
                        : PaymentStatusEnum.WAIT_FOR_PAYMENT,
            },
            orderStatus:
                data2CreateOrder.paymentMethod === PaymentMethodEnum.COD
                    ? OrderStatusEnum.PENDING
                    : OrderStatusEnum.PROCESSING,
        });
        newOrder.paymentOrder.paymentUrl = await this.getPaymentUrl(
            data2CreateOrder.paymentMethod,
            newOrder,
            ip,
            data2CreateOrder.paymentReturnUrl,
        );

        // Create a session to start transaction
        const session: ClientSession = await this.productService.startTransaction();
        // Lock the `createOrder` for each user and product
        const lockOrder: Lock = await this.redlockService.lock(resources, 5000);

        // Create order to return
        let resultOrder: Order;
        try {
            [resultOrder] = await Promise.all([
                this.orderService.createOrder(newOrder, session),
                this.reduceStock(reviewedOrder.productSelected, session),
                this.removeProductFromCart(
                    convertToObjectId(userFound._id),
                    reviewedOrder.productSelected,
                    session,
                ),
            ]);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();

            this.logger.error(error.message);
            throw new RpcException(
                new UnprocessableEntityException('Some problem with your order, please try again'),
            );
        } finally {
            await Promise.all([this.redlockService.unlock(lockOrder), session.endSession()]);
        }

        // Emit a event to communications service that a new order is created
        this.communicationsService.emit(NotifyEventPattern.newOrderCreated, {
            order: resultOrder,
            customer: userFound,
        });

        return {
            ...resultOrder,
            customer: cleanUserBeforeResponse(userFound),
        };
    }

    /**
     * @description Get user's orders
     */
    public async getUserOrders({
        user,
        data2Get,
    }: {
        user: TCurrentUser;
        data2Get: GetUserOrdersRequestDTO;
    }) {
        const { orderStatus, paymentMethod, paymentStatus } = data2Get;
        const { page, pageSize } = new PaginationQuery({
            page: data2Get?.page,
            pageSize: data2Get?.pageSize,
        });

        const filterQueries: FilterQuery<Order> = {
            userId: convertToObjectId(user._id),
            ...(orderStatus && { orderStatus }),
            ...(paymentMethod && { 'paymentOrder.method': paymentMethod }),
            ...(paymentStatus && { 'paymentOrder.status': paymentStatus }),
        };
        const optionQueries: QueryOptions<Order> = {
            ...convertPageQueryToMongoose({ page, pageSize }),
        };

        const [orders, totalRecord] = await Promise.all([
            this.orderService.getOrders(filterQueries, optionQueries),
            this.orderService.countOrders(filterQueries),
        ]);

        return new ListDataResponseDTO({
            page,
            pageSize,
            totalPage: Math.ceil(totalRecord / pageSize),
            totalRecord,
            data: orders,
        });
    }

    public async getUserOrderById({ user, id }: { user: TCurrentUser } & ObjectIdParamDTO) {
        return await this.orderService.getUserOrderById(id, convertToObjectId(user._id));
    }

    /**
     * @description Vnpay ipn url, Vnpay will call this url to verify payment
     */
    public async vnpayIpnUrl({
        ...query
    }: VnpayIpnUrlDTO): Promise<IpnResponse | ResponseForVnpayDTO> {
        try {
            const isVerified = await this.vnpayService.verifyReturnUrl({ ...query });
            if (!isVerified.isSuccess) {
                return IpnFailChecksum;
            }

            const order = await this.orderService.getOrderByIdOrNull(
                convertToObjectId(query.vnp_TxnRef),
            );
            if (!order) {
                return IpnOrderNotFound;
            }

            if (order.checkoutOrder.totalPrice !== Number(query.vnp_Amount) / 100) {
                return IpnInvalidAmount;
            }

            // If payment, or order is completed, or canceled, return error
            if (
                order.orderStatus === OrderStatusEnum.COMPLETED ||
                order.paymentOrder.status === PaymentStatusEnum.COMPLETED ||
                order.orderStatus === OrderStatusEnum.CANCELLED
            ) {
                return InpOrderAlreadyConfirmed;
            }

            order.paymentOrder.method = PaymentMethodEnum.VNPAY;
            if (query.vnp_ResponseCode === '00' || query.vnp_TransactionStatus === '00') {
                order.paymentOrder.status = PaymentStatusEnum.COMPLETED;
                order.orderStatus = OrderStatusEnum.PROCESSING;
                this.logger.debug('Payment success');
            } else {
                order.paymentOrder.status = PaymentStatusEnum.CANCELLED;
                order.orderStatus = OrderStatusEnum.CANCELLED;
                this.logger.debug('Payment failed');
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { vnp_SecureHash, ...vnpayQueryData } = query;
            order.paymentOrder.orderData = vnpayQueryData;
            this.logger.debug({ order });
            await this.orderService.updateOrderById(convertToObjectId(order._id), order);
            return IpnSuccess;
        } catch (error) {
            this.logger.error(error);
            return IpnUnknownError;
        }
    }

    public async vnpayReturnUrl({ ...query }: VnpayIpnUrlDTO) {
        const { isSuccess, message } = await this.vnpayService.verifyReturnUrl({ ...query });

        if (!isSuccess) {
            throw new RpcException(
                new UnprocessableEntityException({
                    statusCode: 422, // important for throw a correct error
                    isSuccess,
                    message,
                }),
            );
        }

        return { isSuccess, message };
    }

    public async reGeneratePaymentUrl(data: {
        orderId: Types.ObjectId;
        userId: Types.ObjectId;
        ip: string;
        paymentReturnUrl?: string;
    }) {
        const order = await this.getUserOrderById({
            id: data.orderId,
            user: { _id: convertToObjectId(data.userId) },
        });
        const paymentUrl = await this.getPaymentUrl(
            order.paymentOrder.method,
            order,
            data.ip,
            data?.paymentReturnUrl,
        );

        if (!paymentUrl) {
            throw new BadRequestException(
                this.i18n.t('errorMessage.CAN_NOT_GET_PAYMENT_URL', {
                    args: {
                        method: order.paymentOrder.method,
                    },
                }),
            );
        }

        const newOrder = await this.orderService.updateOrderById(order._id, {
            ...order,
            paymentOrder: {
                ...order.paymentOrder,
                paymentUrl,
            },
        });

        return newOrder;
    }

    /// PRIVATE METHOD

    /**
     *
     * @param product Product to get dimensions (height, width, length, weight)
     * @returns {TProductDimensions}
     */
    private getDimensions(product: Product): TProductDimensions {
        const { generalAttributes } = product;
        const attributeArray = Array.from(new Set([...generalAttributes]));
        let height: number, width: number, length: number, weight: number;
        attributeArray.forEach((attribute) => {
            if (attribute.k === 'height') {
                height = Number(attribute.v);
            }
            if (attribute.k === 'width') {
                width = Number(attribute.v);
            }
            if (attribute.k === 'length') {
                length = Number(attribute.v);
            }
            if (attribute.k === 'weight') {
                weight = Number(attribute.v);
            }
        });

        if (!height || !width || !length || !weight) {
            throw new RpcException(
                new BadRequestException(
                    'Product is missing dimensions (height, width, length, weight)',
                ),
            );
        }

        return { height, width, length, weight };
    }

    /**
     * Create tracking code base on address info and timestamp
     * @param address address to create tracking code
     * @returns {string} tracking code
     */
    private createTrackingCode(address: AddressSchema): string {
        const timestamp = Date.now();
        const trackingCode = `${address.districtLevel.district_id}-${address.wardLevel.ward_code}-${timestamp}`;
        return trackingCode;
    }

    /**
     * Reduce stock of product
     * @param productSelected {Array<ProductCartDTO>} - Product selected to reduce stock
     * @param session The session store transaction
     * @returns Array of Promise to update product stock
     */
    private async reduceStock(productSelected: Array<ProductCartDTO>, session: ClientSession) {
        return Promise.all(
            productSelected.map(async (product) => {
                const productInfo = await this.productService.getProduct({
                    filterQueries: { _id: convertToObjectId(product.productId) },
                });
                const skuIndex = productInfo.variations.findIndex((p) => p.sku === product.sku);
                if (skuIndex < 0) {
                    throw new RpcException(
                        new BadRequestException(
                            `Product with sku not found in product info: '${product.sku}'`,
                        ),
                    );
                }

                if (product.quantity > productInfo.variations[skuIndex].stock) {
                    throw new RpcException(
                        new BadRequestException(
                            `Selected quantity for product '${productInfo.name}' with sku '${productInfo.variations[skuIndex].sku}' is greater than the available stock (${productInfo.variations[skuIndex].stock})`,
                        ),
                    );
                }
                productInfo.variations[skuIndex].stock -= product.quantity;
                return this.productService.updateProductByIdLockSession(
                    convertToObjectId(product.productId),
                    productInfo,
                    session,
                );
            }),
        );
    }

    /**
     * Remove product from cart
     * @param userId User id to get cart
     * @param productSelected Product selected to remove from cart
     * @param session The session store transaction
     * @returns Promise to update cart
     */
    private async removeProductFromCart(
        userId: Types.ObjectId,
        productSelected: Array<ProductCartDTO>,
        session: ClientSession,
    ) {
        const cart = await this.cartService.getCartByUserIdOrFail({ userId });
        if (!cart) {
            return;
        }
        cart.products = cart.products.filter(
            (product) =>
                !productSelected.find(
                    (productSelected) =>
                        product.productId.toString() === productSelected.productId.toString() &&
                        product.sku === productSelected.sku,
                ),
        );
        cart.cartCountProducts = cart.products.length;
        return this.cartService.updateCartLockSession({ ...cart }, session);
    }

    /**
     * Get payment url
     * @param paymentMethod Enum of payment method
     * @param newOrder Order information
     * @returns Payment url
     */
    private async getPaymentUrl(
        paymentMethod: CreateOrderRequestDTO['paymentMethod'],
        newOrder: Order,
        ip: string,
        returnUrl?: string,
    ): Promise<string | null> {
        const data2CreatePayment = {
            vnp_IpAddr: ip,
            vnp_Amount: newOrder.checkoutOrder.totalPrice,
            vnp_OrderInfo: `Thanh toan don hang TechCell ${newOrder._id.toString()}`,
            vnp_OrderType: ProductCode.Bill,
            vnp_TxnRef: newOrder._id.toString(),
        };
        switch (paymentMethod) {
            case PaymentMethodEnum.VNPAY: {
                if (!returnUrl) {
                    throw new BadRequestException(
                        this.i18n.translate('errorMessage.RETURN_URL_REQUIRED', {
                            args: {
                                method: paymentMethod,
                            },
                        }),
                    );
                }

                const vnpayUrl = await this.vnpayService.createPaymentUrl({
                    ...data2CreatePayment,
                    vnp_ReturnUrl: returnUrl,
                });
                if (!vnpayUrl) {
                    throw new RpcException(
                        new InternalServerErrorException(
                            this.i18n.translate('errorMessage.CAN_NOT_CREATE_ORDER'),
                        ),
                    );
                }
                return vnpayUrl;
            }
            case PaymentMethodEnum.ATM:
            case PaymentMethodEnum.JCB:
            case PaymentMethodEnum.MASTERCARD:
            case PaymentMethodEnum.VISA: {
                if (!returnUrl) {
                    throw new BadRequestException(
                        this.i18n.translate('errorMessage.RETURN_URL_REQUIRED', {
                            args: {
                                method: paymentMethod,
                            },
                        }),
                    );
                }
                const vnpayUrl = await this.vnpayService.createPaymentUrl({
                    ...data2CreatePayment,
                    bankCode: paymentMethod,
                    vnp_ReturnUrl: returnUrl,
                });
                if (!vnpayUrl) {
                    throw new RpcException(
                        new InternalServerErrorException(
                            this.i18n.translate('errorMessage.CAN_NOT_CREATE_ORDER', {
                                args: {
                                    method: paymentMethod,
                                },
                            }),
                        ),
                    );
                }
                return vnpayUrl;
            }

            case PaymentMethodEnum.COD:
            // case PaymentMethodEnum.MOMO:
            default:
                return null;
        }
    }

    private validatePayment(data2CreateOrder: CreateOrderRequestDTO) {
        const { paymentMethod, paymentReturnUrl } = data2CreateOrder;
        switch (paymentMethod) {
            case PaymentMethodEnum.VNPAY:
            case PaymentMethodEnum.ATM:
            case PaymentMethodEnum.JCB:
            case PaymentMethodEnum.MASTERCARD:
            case PaymentMethodEnum.VISA: {
                if (!paymentReturnUrl) {
                    throw new BadRequestException(
                        this.i18n.translate('errorMessage.RETURN_URL_REQUIRED', {
                            args: {
                                method: paymentMethod,
                            },
                        }),
                    );
                }
                break;
            }

            case PaymentMethodEnum.COD:
            default:
                return true;
        }
    }
}
