import { Injectable } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { CreateCartDTO } from './dtos';
import { IGetCartByProduct } from './interfaces';
import { Cart } from './schemas';

@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository) {}

    async createCart({ userId, products }: CreateCartDTO) {
        return this.cartRepository.create({
            userId,
            products,
        });
    }

    /**
     * @description Update cart if user already has cart (upsert)
     * @param param0 userId and array of all product in cart
     * @returns updated cart
     */
    async updateCart({ userId, products }: CreateCartDTO) {
        return this.cartRepository.upsert({ userId }, { products });
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
        return this.cartRepository.count({ userId: new Types.ObjectId(userId) });
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
}
