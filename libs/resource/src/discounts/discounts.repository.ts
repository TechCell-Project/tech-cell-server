import { AbstractRepository } from '~libs/resource/abstract';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Discount } from './schemas';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class DiscountsRepository extends AbstractRepository<Discount> {
    protected readonly logger = new Logger(DiscountsRepository.name);

    constructor(
        @InjectModel(Discount.name) discountModel: Model<Discount>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(discountModel, connection, i18n);
    }

    async isDiscountExist(discountCode: string): Promise<Discount> | null {
        try {
            return await this.findOne({ discountCode: discountCode });
        } catch (error) {
            return null;
        }
    }
}
