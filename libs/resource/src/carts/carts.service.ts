import { Injectable } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { Types } from 'mongoose';

@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository) {}

    // async createCart() {
    //     const cart = await this.cartRepository.create({});
    //     return cart;
    // }

    async getCarts(userId: Types.ObjectId) {
        return this.cartRepository.find({ userId });
    }
}
