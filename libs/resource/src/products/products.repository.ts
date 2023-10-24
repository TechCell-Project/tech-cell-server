import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Product } from './schemas';

@Injectable()
export class ProductsRepository extends AbstractRepository<Product> {
    protected readonly logger = new Logger(ProductsRepository.name);
    // bắt lỗi exception nếu không tìm thấy dữ liệu
    constructor(
        @InjectModel(Product.name) productModel: Model<Product>,
        @InjectConnection() connection: Connection,
    ) {
        super(productModel, connection);
    }
}
