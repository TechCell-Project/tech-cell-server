import { TCurrentUser } from '@app/common/types';
import { UsersService } from '@app/resource/users';
import { GhnService } from '@app/third-party/giaohangnhanh';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClientSession, Types } from 'mongoose';
import { ReviewOrderRequestDTO, ReviewedOrderResponseDTO, VnpayIpnUrlDTO } from './dtos';
import { Product, ProductsService } from '@app/resource';
import { TProductDimensions } from './types';
import { ItemShipping } from '@app/third-party/giaohangnhanh/dtos';
import { CreateOrderDTO } from '@app/resource/orders/dtos/create-order.dto';
import { OrderStatus, PaymentStatus } from '@app/resource/orders/enums';
import { AddressSchema } from '@app/resource/users/schemas/address.schema';
import { Order, OrdersService } from '@app/resource/orders';
import { ProductCartDTO } from '@app/resource/carts/dtos/product-cart.dto';
import { CartsService } from '@app/resource/carts/carts.service';
import { RedlockService } from '@app/common/Redis/services/redlock.service';
import { CreateOrderRequestDTO } from './dtos/create-order-request.dto';
import { VnpayService } from '@app/third-party/vnpay.vn';
import { ProductCode } from '@app/third-party/vnpay.vn/enums';
import { PaymentMethodEnum } from './enums';
import { ResponseForVnpayDTO } from './dtos/response-for-vnpay.dto';

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
                _id: new Types.ObjectId(user._id),
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
                    filterQueries: { _id: new Types.ObjectId(productId) },
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

            const price = productWithSku.price.base;
            return total + price;
        }, 0);

        const { total, service_fee } = await this.ghnService.calculateShippingFee({
            address: addressSelected,
            items: listItemShipping,
        });
        const giaohangnhanh = { total, service_fee };

        return new ReviewedOrderResponseDTO({
            ...dataReview,
            shipping: { giaohangnhanh },
            totalProductPrice: totalProductPrice,
        });
    }

    /**
     * @description Create order
     */
    public async createOrder({
        user,
        data2CreateOrder,
    }: {
        user: TCurrentUser;
        data2CreateOrder: CreateOrderRequestDTO;
    }) {
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
            _id: new Types.ObjectId(user._id),
        });

        // Build a new order data
        const newOrder = new CreateOrderDTO({
            userId: userFound._id,
            shippingOrder: {
                toAddress: userFound.address[reviewedOrder.addressSelected],
            },
            checkoutOrder: {
                shippingFee: reviewedOrder.shipping.giaohangnhanh.total,
                totalApplyDiscount: 0,
                totalPrice:
                    reviewedOrder.totalProductPrice + reviewedOrder.shipping.giaohangnhanh.total,
            },
            orderStatus: OrderStatus.PENDING,
            products: reviewedOrder.productSelected,
            trackingCode: this.createTrackingCode(userFound.address[reviewedOrder.addressSelected]),
            paymentOrder: {
                method: data2CreateOrder.paymentMethod,
                status: PaymentStatus.PROCESSING,
            },
        });

        // Create a session to start transaction
        const session = await this.productService.startTransaction();

        // Create order to return
        let resultOrder: Order;
        let paymentUrl: string | null = null;
        try {
            // Lock the `createOrder` for each user and product
            const lock = await this.redlockService.lock(resources, 5000);
            try {
                [resultOrder] = await Promise.all([
                    this.orderService.createOrder(newOrder, session),
                    this.reduceStock(reviewedOrder.productSelected, session),
                    this.removeProductFromCart(
                        userFound._id,
                        reviewedOrder.productSelected,
                        session,
                    ),
                ]);
                paymentUrl = await this.getPaymentUrl(data2CreateOrder.paymentMethod, resultOrder);
                await session.commitTransaction();
            } finally {
                await this.redlockService.unlock(lock);
            }
        } catch (error) {
            await session.abortTransaction();

            this.logger.error(error.message);
            throw new RpcException(
                new UnprocessableEntityException('Some problem with your order, please try again'),
            );
        } finally {
            await session.endSession();
        }

        return { ...resultOrder, paymentUrl: paymentUrl ?? undefined };
    }

    /**
     * @description Vnpay ipn url, Vnpay will call this url to verify payment
     */
    public async vnpayIpnUrl({ ...query }: VnpayIpnUrlDTO): Promise<ResponseForVnpayDTO> {
        try {
            const isVerified = await this.vnpayService.verifyReturnUrl({ ...query });
            if (!isVerified.isSuccess) {
                return {
                    RspCode: '97',
                    Message: 'Invalid signature',
                };
            }

            const order = await this.orderService.getOrderByIdOrNull(
                new Types.ObjectId(query.vnp_TxnRef),
            );
            if (!order) {
                return {
                    RspCode: '01',
                    Message: 'Order not found',
                };
            }

            if (order.checkoutOrder.totalPrice !== Number(query.vnp_Amount) / 100) {
                return {
                    RspCode: '04',
                    Message: 'Invalid amount',
                };
            }

            // If payment, or order is completed, or canceled, return error
            if (
                order.orderStatus === OrderStatus.COMPLETED ||
                order.paymentOrder.status === PaymentStatus.COMPLETED ||
                order.orderStatus === OrderStatus.CANCELLED
            ) {
                return {
                    RspCode: '02',
                    Message: 'Order already confirmed',
                };
            }

            order.paymentOrder.method = PaymentMethodEnum.VNPAY;
            if (query.vnp_ResponseCode === '00' || query.vnp_TransactionStatus === '00') {
                order.paymentOrder.status = PaymentStatus.COMPLETED;
                order.orderStatus = OrderStatus.PROCESSING;
            } else {
                order.paymentOrder.status = PaymentStatus.CANCELLED;
                order.orderStatus = OrderStatus.CANCELLED;
            }

            await this.orderService.updateOrderById(order._id, order);
            return {
                RspCode: '00',
                Message: 'Confirm success',
            };
        } catch (error) {
            this.logger.error(error);
            return {
                RspCode: '99',
                Message: 'Unknown error',
            };
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
                    filterQueries: { _id: new Types.ObjectId(product.productId) },
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
                    new Types.ObjectId(product.productId),
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
     * @param resultOrder Order information
     * @returns Payment url
     */
    private async getPaymentUrl(
        paymentMethod: CreateOrderRequestDTO['paymentMethod'],
        resultOrder: Order,
    ): Promise<string | null> {
        switch (paymentMethod) {
            case PaymentMethodEnum.VNPAY:
                const vnpayUrl = await this.vnpayService.createPaymentUrl({
                    vnp_IpAddr: '127.0.0.1',
                    vnp_Amount: resultOrder.checkoutOrder.totalPrice,
                    vnp_OrderInfo: `Thanh toan don hang TechCell ${resultOrder._id.toString()}`,
                    vnp_OrderType: ProductCode.Bill,
                    vnp_TxnRef: resultOrder._id.toString(),
                });

                if (!vnpayUrl) {
                    throw new RpcException(
                        new InternalServerErrorException('Cannot create payment url'),
                    );
                }
                return vnpayUrl;
            case PaymentMethodEnum.COD:
            // case PaymentMethodEnum.MOMO:
            default:
                return null;
        }
    }
}
