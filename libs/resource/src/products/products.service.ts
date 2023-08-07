import { Injectable } from '@nestjs/common';
import { CreateProductDTO } from './dtos';
import { ProductsRepository } from './products.repository';
import { IBaseQuery } from '../interfaces';
import { Product } from './schemas';

@Injectable()
export class ProductsService {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async createProduct({ ...createProductDto }: CreateProductDTO) {
        const product = await this.productsRepository.create({ ...createProductDto });
        return product;
    }

    async getProduct({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Product>) {
        const product = await this.productsRepository.findOne(
            filterQueries,
            queryOptions,
            projectionArgs,
        );
        return product;
    }

    async getProducts() {
        const products = await this.productsRepository.find({});
        return products;
    }
}
