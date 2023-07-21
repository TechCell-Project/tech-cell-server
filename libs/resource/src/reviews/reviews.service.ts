import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateProductReviewDto } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { ProductReview } from './schemas/review.schema';
import { ProductReviewsRepository } from './reviews.repository';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class ProductReviewsService {
    constructor(private readonly productReviewRepository: ProductReviewsRepository) {}

    async createProductReview({ userId, productId, rating, comment }: CreateProductReviewDto) {
        return this.productReviewRepository.create({ userId, productId, rating, comment });
    }
}
