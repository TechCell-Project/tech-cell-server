import { Injectable } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { Types } from 'mongoose';
import { CreateCartDTO } from './dtos';
import { IGetCartByProduct } from './interfaces';

@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository) {}

    async createCart({ userId, products }: CreateCartDTO) {
        return this.cartRepository.create({
            userId,
            products,
        });
    }

    async addProductToCart({ userId, products }: CreateCartDTO) {
        return this.cartRepository.upsert({ userId }, { products });
    }

    async getCarts(userId: Types.ObjectId) {
        return this.cartRepository.find({ userId });
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

    async getCartByUserId(userId: Types.ObjectId) {
        return this.cartRepository.findOne({ userId });
    }
}
