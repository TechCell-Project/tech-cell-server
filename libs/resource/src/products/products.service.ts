import { Injectable } from '@nestjs/common';
import { CreateProductDTO } from './dtos';
import { ProductsRepository } from './products.repository';
import { IBaseQuery } from '../interfaces';
import { Product } from './schemas';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { ProductStatus } from './enums';
import { SelectType } from '~/apps/search/enums';
import { SelectTypeDTO } from '~/apps/search/dtos';

@Injectable()
export class ProductsService {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async createProduct({ ...createProductDto }: CreateProductDTO) {
        return await this.productsRepository.create({ ...createProductDto });
    }

    async getProduct({
        filterQueries,
        queryOptions,
        projectionArgs,
        selectType,
    }: IBaseQuery<Product> & SelectTypeDTO) {
        // Resolve the select type
        switch (selectType) {
            case SelectType.onlyDeleted:
                filterQueries.status = {
                    $eq: ProductStatus.Deleted,
                };
                break;

            case SelectType.both:
                filterQueries.status = {};
                filterQueries.variations = {};
                delete filterQueries.status;
                delete filterQueries.variations;
                break;

            case SelectType.onlyActive:
            default:
                filterQueries.status = { $gt: ProductStatus.Deleted };
                filterQueries.variations = {
                    $elemMatch: {
                        $or: [
                            { status: { $gt: ProductStatus.Deleted } },
                            { status: { $exists: false } },
                        ],
                    },
                };
                break;
        }

        return await this.productsRepository.findOne(filterQueries, queryOptions, projectionArgs);
    }

    async getProducts({
        filterQueries,
        queryOptions,
        projectionArgs,
        selectType,
    }: IBaseQuery<Product> & SelectTypeDTO) {
        switch (selectType) {
            case SelectType.onlyDeleted:
                Object.assign(filterQueries, {
                    $or: [
                        { status: ProductStatus.Deleted },
                        {
                            status: { $ne: ProductStatus.Deleted },
                            variations: {
                                $not: {
                                    $elemMatch: { status: { $ne: ProductStatus.Deleted } },
                                },
                            },
                        },
                    ],
                });
                break;

            case SelectType.both:
                filterQueries.status = {};
                filterQueries.variations = {};
                delete filterQueries.status;
                delete filterQueries.variations;
                break;

            case SelectType.onlyActive:
                filterQueries.status = { $gt: ProductStatus.Deleted };
                filterQueries.variations = {
                    $elemMatch: {
                        $or: [
                            { status: { $gt: ProductStatus.Deleted } },
                            { status: { $exists: false } },
                        ],
                    },
                };
                break;
            default:
                break;
        }

        return await this.productsRepository.find({
            filterQuery: filterQueries,
            queryOptions,
            projection: projectionArgs,
        });
    }

    async countProducts(filterQueries: FilterQuery<Product> = {}) {
        return await this.productsRepository.count(filterQueries);
    }

    async updateProductById(
        productId: Types.ObjectId,
        updateQueries: UpdateQuery<Partial<Product>>,
    ) {
        return await this.productsRepository.findOneAndUpdate(
            productId,
            Object.assign(updateQueries, {
                $set: {
                    updatedAt: new Date(),
                },
            }),
        );
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
                            'descriptionImages.publicId': publicId,
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

    async deleteProductById(productId: Types.ObjectId) {
        const product = await this.productsRepository.findOneAndUpdate(
            { _id: productId },
            {
                $set: {
                    status: ProductStatus.Deleted,
                    updatedAt: new Date(),
                },
            },
        );
        return product;
    }
}
