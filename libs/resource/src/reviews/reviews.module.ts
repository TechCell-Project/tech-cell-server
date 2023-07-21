import { Module } from '@nestjs/common';
import { ProductReviewsService } from './reviews.service';

import { RabbitMQModule, RabbitMQService, MongodbModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductReview, ProductReviewSchema } from './schemas/review.schema';
import { ProductReviewsRepository } from './reviews.repository';
// import { ValidationModule } from '@app/common';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([{ name: ProductReview.name, schema: ProductReviewSchema }]),
    ],
    controllers: [],
    providers: [ProductReviewsService, ProductReviewsRepository],
    exports: [ProductReviewsService],
})
export class ProductReviewsModule {}
