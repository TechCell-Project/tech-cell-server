import { AbstractRepository } from '@app/resource/abstract';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Discount } from './schemas';

@Injectable()
export class DiscountsRepository extends AbstractRepository<Discount> {
    protected readonly logger = new Logger(DiscountsRepository.name);

    constructor(
        @InjectModel(Discount.name) discountModel: Model<Discount>,
        @InjectConnection() connection: Connection,
    ) {
        super(discountModel, connection);
    }

    async isDiscountExist(discountCode: string): Promise<Discount> | null {
        try {
            return await this.findOne({ discountCode: discountCode });
        } catch (error) {
            return null;
        }
    }
}
