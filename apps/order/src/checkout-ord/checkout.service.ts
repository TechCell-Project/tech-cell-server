import { TCurrentUser } from '@app/common/types';
import { UsersService } from '@app/resource/users';
import { GhnService } from '@app/third-party/giaohangnhanh';
import {
    BadRequestException,
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClientSession, Types } from 'mongoose';
import { ReviewOrderRequestDTO, ReviewedOrderResponseDTO } from './dtos';
import { Product, ProductsService } from '@app/resource';
import { TProductDimensions } from './types';
import { ItemShipping } from '@app/third-party/giaohangnhanh/dtos';
import { CreateOrderDTO } from '@app/resource/orders/dtos/create-order.dto';
import { OrderStatus } from '@app/resource/orders/enums';
import { AddressSchema } from '@app/resource/users/schemas/address.schema';
import { Order, OrdersService } from '@app/resource/orders';
import { ProductCartDTO } from '@app/resource/carts/dtos/product-cart.dto';
import { CartsService } from '@app/resource/carts/carts.service';
import { RedlockService } from '@app/common/Redis/services/redlock.service';

@Injectable()
export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);
    constructor(
        private readonly ghnService: GhnService,
        private readonly userService: UsersService,
        private readonly productService: ProductsService,
        private readonly orderService: OrdersService,
        private readonly cartService: CartsService,
        private readonly redlockService: RedlockService,
    ) {}

    async reviewOrder({
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

    async createOrder({
        user,
        dataReview,
    }: {
        user: TCurrentUser;
        dataReview: ReviewOrderRequestDTO;
    }) {
        const reviewedOrder = await this.reviewOrder({ user, dataReview });

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
                totalPrice: reviewedOrder.totalProductPrice,
                totalApplyDiscount: 0,
                shippingFee: reviewedOrder.shipping.giaohangnhanh.total,
            },
            orderStatus: OrderStatus.PENDING,
            products: reviewedOrder.productSelected,
            trackingCode: this.createTrackingCode(userFound.address[reviewedOrder.addressSelected]),
        });

        // Create a session to start transaction
        const session = await this.productService.startTransaction();

        // Create order to return
        let resultOrder: Order;
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

        return resultOrder;
    }

    /**
     *
     * @param product Product to get dimensions
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

    private createTrackingCode(address: AddressSchema) {
        const timestamp = Date.now();
        const trackingCode = `${address.districtLevel.district_id}-${address.wardLevel.ward_code}-${timestamp}`;
        return trackingCode;
    }

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
}
