import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { SearchProductsRequestDTO, GetProductsByCateRequestDTO, CreateProductDto } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { Product } from './schemas/product.schema';
import { ProductsRepository } from './products.repository';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class ProductsService {
    constructor(private readonly productsRepository: ProductsRepository) {}

    // async getAllProducts() {
    //     return this.productsRepository.find({});
    // }

    async createProduct({
        name,
        attributes,
        manufacturer,
        categories,
        images,
        stock,
        filter,
        price,
        special_price,
        thumbnail,
        status,
    }: CreateProductDto) {
        await this.productDuplicationCheck({ name });
        const newProduct = {
            general: {
                name,
                attributes,
                manufacturer,
                images,
                categories,
            },
            filterable: {
                stock,
                filter,
                price,
                special_price,
                thumbnail,
            },
            status,
        };
        return this.productsRepository.create(newProduct);
    }

    private async productDuplicationCheck({ name }: { name: string }) {
        const productCount = await this.productsRepository.count({
            name: name,
        });

        if (productCount > 0) {
            throw new RpcException(new UnprocessableEntityException('Product already exists.'));
        }
    }

    // async searchByName({ searchTerm, page, sortField, sortOrder }: SearchProductsRequestDTO) {
    //     return this.productsRepository.searchProducts(searchTerm, page, sortField, sortOrder);
    // }

    // async getByCategory({ category, page, sortField, sortOrder }: GetProductsByCateRequestDTO) {
    //     return this.productsRepository.getProductsByCategory(category, page, sortField, sortOrder);
    // }

    async getProducts(
        getProductsArgs: Partial<Product>,
        queryArgs?: Partial<QueryOptions<Product>>,
        projectionArgs?: Partial<ProjectionType<Product>>,
    ) {
        return this.productsRepository.find(getProductsArgs, queryArgs, projectionArgs);
    }

    async findOneAndUpdateProduct(
        filterQuery: FilterQuery<Product>,
        updateProductArgs: Partial<Product>,
    ) {
        if ('name' in updateProductArgs) {
            const existingProduct = await this.productsRepository.findOne({
                name: updateProductArgs.name,
            });

            if (existingProduct && existingProduct._id.toString() !== filterQuery._id.toString()) {
                throw new Error('Product with the same name already exists');
            }
        }
        return this.productsRepository.findOneAndUpdate(filterQuery, updateProductArgs);
    }

    async countProduct(filterQuery: FilterQuery<Product>) {
        return await this.productsRepository.count(filterQuery);
    }

    // async calculateAverageRating(getProductArgs: Partial<Product>, rating: number) {
    //     const product = await this.getProduct(getProductArgs, {}, ['review_stats']);
    //     if (!product) {
    //         throw new NotFoundException('Product not found');
    //     }

    //     const reviews = product.review_stats;
    //     const totalReviews = reviews.review_count;
    //     const averageRating = (reviews.average_rating + rating) / totalReviews;

    //     product.review_stats.average_rating = averageRating;
    //     product.review_stats.review_count = totalReviews;

    //     return { averageRating, totalReviews };
    // }

    // async getProductStats(productId: string) {
    //     const product = await this.productModel.findById(productId);
    //     if (!product) {
    //         throw new NotFoundException('Product not found');
    //     }

    //     return {
    //         averageRating: product.averageRating,
    //         totalReviews: product.totalReviews,
    //     };
    // }
}
