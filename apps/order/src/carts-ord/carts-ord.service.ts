import { Cart, CartsService } from '~libs/resource/carts';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AddCartRequestDTO } from './dtos/create-cart-request.dto';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { ProductsService } from '~libs/resource';
import { TCurrentUser } from '~libs/common/types';
import { DeleteProductsCartRequestDTO } from './dtos';
import { CartState } from '~libs/resource/carts/enums';
import { CartDTO } from '~libs/resource/carts/dtos';
import { convertToObjectId } from '~libs/common';
import { ProductStatus } from '~libs/resource/products/enums';
import { SelectType } from '~apps/search/enums';

@Injectable()
export class CartsOrdService {
    private readonly logger = new Logger(CartsOrdService.name);
    constructor(
        private readonly cartsService: CartsService,
        private readonly productsService: ProductsService,
    ) {}

    async getCarts({ user }: { user: TCurrentUser }): Promise<CartDTO> {
        this.logger.log(`Get carts of user ${user._id}`);
        const cart = await this.cartsService.getCartByUserId({
            userId: convertToObjectId(user._id),
        });
        const productSelectList = Array.from(
            new Set(
                cart.products.map((product) => {
                    return {
                        id: product.productId,
                        sku: product.sku,
                    };
                }),
            ),
        );

        let cartUpdate = cart;
        for (let i = 0; i < productSelectList.length; i++) {
            try {
                const product = await this.productsService.getProduct({
                    filterQueries: { _id: convertToObjectId(productSelectList[i].id) },
                    selectType: SelectType.both,
                });
                const selectSku = product.variations.find(
                    (variation) =>
                        variation.sku === productSelectList[i].sku &&
                        variation.status !== ProductStatus.Deleted,
                );
                if (!product || product.status === ProductStatus.Deleted || !selectSku) {
                    this.logger.debug(
                        `Removing product ${productSelectList[i].id} from cart of user ${user._id}`,
                    );
                    cartUpdate.products = cartUpdate.products.filter(
                        (p) =>
                            !p.productId.equals(productSelectList[i].id) &&
                            p.sku !== productSelectList[i].sku,
                    );
                }
            } catch (error) {
                this.logger.debug(
                    `Removing product ${productSelectList[i].id} from cart of user ${user._id}`,
                );
                cartUpdate.products = cartUpdate.products.filter(
                    (p) =>
                        !p.productId.equals(productSelectList[i].id) &&
                        p.sku !== productSelectList[i].sku,
                );
            }
        }

        if (cart.products.length !== cartUpdate.products.length) {
            cartUpdate = await this.cartsService.updateCart(cartUpdate);
        }

        return cartUpdate;
    }

    public async addProductToCart({
        cartData,
        user,
    }: {
        cartData: AddCartRequestDTO;
        user: TCurrentUser;
    }) {
        const userId = convertToObjectId(user._id);
        const { productId, sku, quantity } = new AddCartRequestDTO(cartData);

        // Check if product exists
        await this.validateProduct({ productId, sku, quantity });

        // Check if user already has cart
        const isUserHasCart = await this.cartsService.countCartUser(userId);
        if (isUserHasCart) {
            // Update cart if user already has cart
            const cart = await this.cartsService.getCartByUserId({ userId });
            const cartToAdd = this.updateCartUtil({ oldCart: cart, productId, sku, quantity });
            return await this.cartsService.updateCart(cartToAdd);
        }

        // Create new cart if user does not have cart
        const newCart = this.buildNewCart(userId, productId, sku, quantity);
        return await this.cartsService.createCart(newCart);
    }

    public async deleteProductsCart({
        cartsData,
        user,
    }: {
        cartsData: DeleteProductsCartRequestDTO;
        user: TCurrentUser;
    }) {
        const userId = convertToObjectId(user._id);
        const { selectProducts, isAll } = new DeleteProductsCartRequestDTO(cartsData);
        console.log({ selectProducts, isAll });

        if (!selectProducts && !isAll) {
            throw new RpcException(new BadRequestException('Nothing to delete'));
        }

        if (isAll) {
            const cart = await this.cartsService.getCartByUserId({ userId });
            cart.products = [];
            cart.cartCountProducts = 0;
            await this.cartsService.updateCart(cart);
            return await this.cartsService.updateCart(cart);
        }

        if (selectProducts) {
            // Catch error if product already deleted
            // Will throw error if product does not exist or user delete many times
            try {
                await Promise.all(
                    selectProducts.map((product) =>
                        this.addProductToCart({
                            cartData: {
                                productId: product.productId,
                                sku: product.sku,
                                quantity: -1,
                            },
                            user,
                        }),
                    ),
                );
            } catch (error) {
                return {
                    message: 'Delete product in cart successfully',
                };
            }
        }

        return {
            message: 'Delete product in cart successfully',
        };
    }

    // Utils below

    /**
     * @description Update cart if user already has cart
     * @property oldCart the cart to update
     * @property productId product id to update wit cart
     * @property sku sku of product to update with cart
     * @property quantity quantity of product to update with cart
     * @property userId user id to update with cart
     * @returns updated cart
     */
    private updateCartUtil({
        oldCart,
        productId,
        sku,
        quantity,
    }: {
        oldCart: Cart;
        productId: Types.ObjectId;
        sku: string;
        quantity: number;
    }): Cart {
        const PRODUCT_NOT_FOUND = -1;
        const foundIndex = oldCart.products.findIndex(
            (product) => product?.productId?.equals(productId) && product.sku === sku,
        );

        if (foundIndex === PRODUCT_NOT_FOUND) {
            if (quantity <= 0) {
                throw new RpcException(
                    new BadRequestException(
                        'Quantity must be greater than 0 to add product to cart',
                    ),
                );
            }

            // Add product to cart if it does not exist
            oldCart.products.unshift({
                productId,
                quantity,
                sku,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            });
        } else {
            const newQuantity = (oldCart.products[foundIndex].quantity = quantity);
            if (newQuantity <= 0) {
                // Reduce quantity if input quantity is negative
                oldCart.products.splice(foundIndex, 1);
            } else {
                // Increase quantity if product exists
                Object.assign(oldCart.products[foundIndex], {
                    quantity: newQuantity,
                    updatedAt: new Date(Date.now()),
                });
            }
        }

        // Sort cart products by updatedAt
        oldCart.products.sort((a, b) => b?.updatedAt?.getTime() - a?.updatedAt?.getTime());
        oldCart.cartCountProducts = oldCart?.products?.length ?? 0;
        return oldCart;
    }

    private buildNewCart(
        userId: Types.ObjectId,
        productId: Types.ObjectId,
        sku: string,
        quantity: number,
    ): Cart {
        if (quantity <= 0) {
            throw new RpcException(
                new BadRequestException('Quantity must be greater than 0 to add product to cart'),
            );
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
            cartCountProducts: 1,
            cartState: CartState.ACTIVE,
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
            filterQueries: {
                _id: convertToObjectId(productId),
                variations: { $elemMatch: { sku } },
            },
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

        return true;
    }
}
