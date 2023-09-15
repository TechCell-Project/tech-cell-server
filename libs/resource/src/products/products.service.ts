import { Injectable } from '@nestjs/common';
import { CreateProductDTO } from './dtos';
import { ProductsRepository } from './products.repository';
import { IBaseQuery } from '../interfaces';
import { Product } from './schemas';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';

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

    async getProducts({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Product>) {
        const products = await this.productsRepository.find({
            filterQuery: filterQueries,
            queryOptions,
            projection: projectionArgs,
        });
        return products;
    }

    async countProducts(filterQueries: FilterQuery<Product> = {}) {
        return this.productsRepository.count(filterQueries);
    }

    async updateProductById(
        productId: Types.ObjectId,
        updateQueries: UpdateQuery<Partial<Product>>,
    ) {
        const product = await this.productsRepository.findOneAndUpdate(productId, updateQueries);
        return product;
    }

    async isImageInUse(publicId: string) {
        try {
            const products = await this.productsRepository.find({
                filterQuery: {
                    $or: [
                        {
                            'generalImages.publicId': publicId,
                        },
                        {
                            'desImages.publicId': publicId,
                        },
                        {
                            variations: {
                                $elemMatch: {
                                    'images.publicId': publicId,
                                },
                            },
                        },
                    ],
                },
                logEnabled: false,
            });
            return products.length > 0;
        } catch (error) {
            return false;
        }
    }
}
