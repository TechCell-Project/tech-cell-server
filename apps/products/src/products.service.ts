import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas';
import { Model } from 'mongoose';
import { CreateProductRequest } from './dtos';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async create(createProductRequest: CreateProductRequest) {
        const createdProduct = new this.productModel(createProductRequest);
        return createdProduct.save();
    }

    async findAll() {
        return this.productModel.find().exec();
    }
}
