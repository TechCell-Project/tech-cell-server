import {
    Injectable,
    ConflictException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import {
    SearchProductsRequestDTO,
    GetProductsByCateRequestDTO,
    CreateProductRequestDto,
} from './dtos';
import { RpcException } from '@nestjs/microservices';
import { Product } from './schemas/product.schema';
import { ProductsRepository } from './products.repository';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class ProductsService {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async getAllProducts() {
        return this.productsRepository.find({});
    }

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
    }: CreateProductRequestDto) {
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

    // async update(updateProductDto: updateProductDto) {
    //     try {
    //         const updated = this.productsRepository.
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async searchByName({ searchTerm, page, sortField, sortOrder }: SearchProductsRequestDTO) {
        try {
            const productsFound = await this.productsRepository.searchProducts(
                searchTerm,
                page,
                sortField,
                sortOrder,
            );

            if (productsFound.length === 0) {
                throw new NotFoundException('Not found any product!');
            }

            return { productsFound };
        } catch (error) {
            throw new RpcException(
                new ConflictException('An error occurred while searching for products.'),
            );
        }
    }

    async getByCategory({ category, page, sortField, sortOrder }: GetProductsByCateRequestDTO) {
        try {
            const productsFound = await this.productsRepository.getProductsByCategory(
                category,
                page,
                sortField,
                sortOrder,
            );

            if (productsFound.length === 0) {
                throw new NotFoundException('Not found any product!');
            }

            return { productsFound };
        } catch (error) {
            throw new RpcException(
                new ConflictException('An error occurred while getting products.'),
            );
        }
    }

    async getUser(
        getProductArgs: Partial<Product>,
        queryArgs?: Partial<QueryOptions<Product>>,
        projectionArgs?: Partial<ProjectionType<Product>>,
    ) {
        return this.productsRepository.findOne(getProductArgs, queryArgs, projectionArgs);
    }

    async findOneAndUpdateProduct(
        filterQuery: FilterQuery<Product>,
        updateUserArgs: Partial<Product>,
    ) {
        return this.productsRepository.findOneAndUpdate(filterQuery, updateUserArgs);
    }

    async countProduct(filterQuery: FilterQuery<Product>) {
        return await this.productsRepository.count(filterQuery);
    }
}
