import { Injectable } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { ClientSession, FilterQuery, QueryOptions, Types } from 'mongoose';
import { CreateCartDTO } from './dtos';
import { IGetCartByProduct } from './interfaces';
import { Cart } from './schemas';
import { CartState } from './enums';
import { RedlockService } from '~libs/common/Redis/services';
import { convertToObjectId } from '~libs/common/utils';

@Injectable()
export class CartsService {
    constructor(
        private readonly cartRepository: CartsRepository,
        private readonly redLock: RedlockService,
    ) {}

    async createCart({ userId, products }: CreateCartDTO) {
        const count = products?.length ?? 0;
        return this.cartRepository.create({
            userId,
            products,
            cartCountProducts: count,
            cartState: CartState.ACTIVE,
        });
    }

    /**
     * @description Update cart if user already has cart (upsert)
     * @param param0 userId and array of all product in cart
     * @returns updated cart
     */
    async updateCart({ userId, products, cartCountProducts }: Cart) {
        return this.cartRepository.upsert({ userId }, { products, cartCountProducts });
    }

    async getCarts(userId: Types.ObjectId) {
        return this.cartRepository.find({ filterQuery: { userId } });
    }

    async getCartByProduct({ userId, productId, sku }: IGetCartByProduct) {
        return this.cartRepository.findOne({
            userId,
            products: { $elemMatch: { productId, sku } },
        });
    }

    async countCartUser(userId: Types.ObjectId) {
        return this.cartRepository.count({ userId: convertToObjectId(userId) });
    }

    async getCartByUserId({
        userId,
        filterQueries,
        options,
    }: {
        userId: Types.ObjectId;
        filterQueries?: FilterQuery<Cart>;
        options?: QueryOptions<Cart>;
    }) {
        return this.cartRepository.findOne({ userId, ...filterQueries }, options);
    }

    async getCartByUserIdOrFail({
        userId,
        filterQueries,
        options,
    }: {
        userId: Types.ObjectId;
        filterQueries?: FilterQuery<Cart>;
        options?: QueryOptions<Cart>;
    }): Promise<Cart | null> | null {
        try {
            return await this.cartRepository.findOne({ userId, ...filterQueries }, options);
        } catch (error) {
            return Promise.resolve(null);
        }
    }

    async startTransaction() {
        return this.cartRepository.startTransaction();
    }

    async updateCartLockSession(
        { userId, products, cartCountProducts }: Cart,
        session: ClientSession,
    ) {
        let result: Cart;
        const lock = await this.redLock.lock([`update_cart:${userId}`], 1000);

        try {
            result = await this.cartRepository.findOneAndUpdate(
                { userId },
                { products, cartCountProducts },
                {},
                session,
            );
        } finally {
            await this.redLock.unlock(lock);
        }

        return result;
    }
}
