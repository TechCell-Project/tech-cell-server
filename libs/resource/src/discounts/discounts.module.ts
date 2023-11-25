import { Module } from '@nestjs/common';
import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Discount, DiscountSchema } from './schemas';
import { DiscountsService } from './discounts.service';
import { DiscountsRepository } from './discounts.repository';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([
            {
                name: Discount.name,
                schema: DiscountSchema,
            },
        ]),
    ],
    providers: [DiscountsRepository, DiscountsService],
    exports: [DiscountsService],
})
export class DiscountsModule {}
