import { Injectable } from '@nestjs/common';
import { DiscountsService } from '@app/resource';
import { CreateDiscountRequestDTO } from './dtos';

@Injectable()
export class DiscountsMntService {
    constructor(private readonly discountsService: DiscountsService) {}

    async createDiscount(discountData: CreateDiscountRequestDTO) {
        return await this.discountsService.createDiscount(discountData as any);
    }
}
