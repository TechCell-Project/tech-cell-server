import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
// import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { DiscountsRepository } from './discounts.repository';
import { Discount } from './schemas';
// import { ApplyDiscountTo } from './enums';

@Injectable()
export class DiscountsService {
    constructor(private readonly discountRepository: DiscountsRepository) {}

    async createDiscount(discount: Omit<Discount, '_id'>): Promise<Discount> {
        if (
            new Date() < new Date(discount.discountStartDate) ||
            new Date() > new Date(discount.discountEndDate)
        ) {
            throw new RpcException(new BadRequestException('Discount time is invalid'));
        }

        if (new Date(discount.discountStartDate) >= new Date(discount.discountEndDate)) {
            throw new RpcException(
                new BadRequestException('Start date must be before end date of discount'),
            );
        }

        const foundDiscount = await this.discountRepository.isDiscountExist(discount.discountCode);
        if (!foundDiscount || foundDiscount.discountIsActive) {
            throw new RpcException(new BadRequestException('Discount code is already in use'));
        }

        return await this.discountRepository.create(discount);
    }
}
