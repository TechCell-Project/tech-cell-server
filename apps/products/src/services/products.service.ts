import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas';
import { Model } from 'mongoose';
import { CreateProductRequest } from '~/apps/products/dtos';
import { ProductRepository } from '../products.repository';

@Injectable()
export class ProductsService {
    constructor(
        private readonly productRepository: ProductRepository,
        @InjectModel(Product.name) private productModel: Model<Product>,
    ) {}

    async getPing() {
        return { message: 'pong' };
    }

    async create(createProductRequest: CreateProductRequest) {
        const session = await this.productRepository.startTransaction();
        try {
            const product = await this.productRepository.create(createProductRequest, { session });
            await session.commitTransaction();
            return product;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        }
    }

    async findAll() {
        return this.productModel.find().exec();
    }
}
