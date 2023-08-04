import { AbstractRepository } from '@app/common';
import { Category } from './schemas';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

export class CategoriesRepository extends AbstractRepository<Category> {
    protected readonly logger = new Logger(CategoriesRepository.name);

    constructor(
        @InjectModel(Category.name) productModel: Model<Category>,
        @InjectConnection() connection: Connection,
    ) {
        super(productModel, connection);
    }
}
