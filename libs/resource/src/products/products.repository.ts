import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '~libs/resource/abstract';
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
}
