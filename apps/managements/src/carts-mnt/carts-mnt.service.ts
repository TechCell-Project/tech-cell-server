import { Cart, CartsService } from '@app/resource/carts';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { AddCartRequestDTO } from './dtos/create-cart-request.dto';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { ProductsService } from '@app/resource';

@Injectable()
export class CartsMntService {
    constructor(
        private readonly cartsService: CartsService,
        private readonly productsService: ProductsService,
    ) {}

    public async addCart({ ...cartData }: AddCartRequestDTO & { userId: string | Types.ObjectId }) {
        const { userId, productId, quantity, sku } = this.parseType({ ...cartData });

        // Check if product exists
        await this.validateProduct({ productId, sku, quantity });

        // Check if user already has cart
        const isUserHasCart = await this.cartsService.countCartUser(userId);

        if (isUserHasCart) {
            // Update cart if user already has cart
            const cart = await this.cartsService.getCartByUserId(userId);
            const cartToAdd = this.updateCart(cart, productId, sku, quantity, userId);
            const updatedCart = await this.cartsService.addProductToCart(cartToAdd);
            return updatedCart;
        } else {
            // Create new cart if user does not have cart
            const newCart = this.createNewCart(userId, productId, sku, quantity);
            const cartCreated = await this.cartsService.createCart(newCart);
            return cartCreated;
        }
    }

    private updateCart(
        cart: Cart,
        productId: Types.ObjectId,
        sku: string,
        quantity: number,
        userId: Types.ObjectId,
    ) {
        const index = cart.products.findIndex(
            (product) => product.productId.equals(productId) && product.sku === sku,
        );

        if (index !== -1) {
            // Reduce quantity if input quantity is negative
            if (quantity < 0) {
                cart.products[index].quantity -= Math.abs(quantity);
                // Remove product if quantity becomes less than or equal to 0
                if (cart.products[index].quantity <= 0) {
                    cart.products.splice(index, 1);
                }
            } else {
                // Increase quantity if product exists
                cart.products[index].quantity += quantity;
            }
            cart.products[index].updatedAt = new Date(Date.now());
            return {
                userId,
                products: [...cart.products],
            };
        } else {
            if (quantity < 0) {
                throw new RpcException(new BadRequestException('Quantity must be greater than 0'));
            }
            // Add product to cart if it does not exist
            return {
                userId,
                products: [
                    {
                        productId,
                        quantity,
                        sku,
                        createdAt: new Date(Date.now()),
                        updatedAt: new Date(Date.now()),
                    },
                    ...cart.products,
                ],
            };
        }
    }

    private createNewCart(
        userId: Types.ObjectId,
        productId: Types.ObjectId,
        sku: string,
        quantity: number,
    ): Cart {
        if (quantity < 0) {
            throw new RpcException(new BadRequestException('Quantity must be greater than 0'));
        }
        // Create new cart if user does not have a cart
        return {
            _id: new Types.ObjectId(),
            userId,
            products: [
                {
                    productId,
                    quantity,
                    sku,
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                },
            ],
        };
    }

    private async validateProduct({
        productId,
        sku,
        quantity,
    }: {
        productId: Types.ObjectId;
        sku: string;
        quantity: number;
    }) {
        const productFound = await this.productsService.getProduct({
            filterQueries: { _id: productId, variations: { $elemMatch: { sku } } },
        });

        productFound.variations.forEach((variation) => {
            if (variation.sku === sku && variation.stock < quantity) {
                throw new RpcException(
                    new BadRequestException(
                        'Product out of stock, remaining ' + variation.stock + ' items',
                    ),
                );
            }
        });
    }

    private parseType({
        productId,
        quantity,
        sku,
        userId,
    }: AddCartRequestDTO & { userId: string | Types.ObjectId }): {
        productId: Types.ObjectId;
        quantity: number;
        sku: string;
        userId: Types.ObjectId;
    } {
        try {
            quantity = Number(quantity);
            productId = new Types.ObjectId(productId);
            userId = new Types.ObjectId(userId);
            return { productId, quantity, sku, userId };
        } catch (error) {
            Logger.error(error);
            throw new RpcException(new InternalServerErrorException('Error when create cart'));
        }
    }
}
