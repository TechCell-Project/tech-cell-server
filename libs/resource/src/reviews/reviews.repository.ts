import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ProductReview } from './schemas';

@Injectable()
export class ProductReviewsRepository extends AbstractRepository<ProductReview> {
    protected readonly logger = new Logger(ProductReviewsRepository.name);

    constructor(
        @InjectModel(ProductReview.name) ProductReviewModel: Model<ProductReview>,
        @InjectConnection() connection: Connection,
    ) {
        super(ProductReviewModel, connection);
    }
}
