import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Product } from './schemas';

@Injectable()
export class ProductsRepository extends AbstractRepository<Product> {
    protected readonly logger = new Logger(ProductsRepository.name);

    constructor(
        @InjectModel(Product.name) productModel: Model<Product>,
        @InjectConnection() connection: Connection,
    ) {
        super(productModel, connection);
    }

    // async searchProducts(
    //     searchTerm: string,
    //     page: number,
    //     sortField: string,
    //     sortOrder: 'asc' | 'desc',
    // ) {
    //     const perPage = 10;
    //     const regex = new RegExp(searchTerm, 'i');
    //     const sortOptions: any = {};
    //     sortOptions[sortField] = sortOrder;

    //     const products = await this.productModel
    //         .find({ name: { $regex: regex } })
    //         .sort(sortOptions)
    //         .skip(perPage * (page - 1))
    //         .limit(perPage)
    //         .exec();

    //     return products;
    // }

    // async getProductsByCategory(
    //     category: string,
    //     page: number,
    //     sortField: string,
    //     sortOrder: 'asc' | 'desc',
    // ) {
    //     const perPage = 10;
    //     const regex = new RegExp(category, 'i');
    //     const sortOptions: any = {};
    //     sortOptions[sortField] = sortOrder;

    //     const products = await this.productModel
    //         .find({ category: { $regex: regex } })
    //         .sort(sortOptions)
    //         .skip(perPage * (page - 1))
    //         .limit(perPage)
    //         .exec();
    //     return products;
    // }
}
