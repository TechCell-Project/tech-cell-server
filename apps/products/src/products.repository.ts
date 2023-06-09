import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Product } from './schemas';

@Injectable()
export class ProductRepository extends AbstractRepository<Product> {
    protected readonly logger = new Logger(ProductRepository.name);

    constructor(
        @InjectModel(Product.name) productModel: Model<Product>,
        @InjectConnection() connection: Connection,
    ) {
        super(productModel, connection);
    }
}
