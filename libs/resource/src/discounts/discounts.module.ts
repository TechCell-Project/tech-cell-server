import { Module } from '@nestjs/common';
import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Discount, DiscountSchema } from './schemas';
import { DiscountsService } from './discounts.service';
import { DiscountsRepository } from './discounts.repository';

@Module({
    imports: [
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
