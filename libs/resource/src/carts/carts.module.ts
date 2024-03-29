import { MongodbModule } from '~libs/common';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas';
import { CartsRepository } from './carts.repository';
import { CartsService } from './carts.service';
import { RedisModule } from '~libs/common/Redis';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([
            {
                name: Cart.name,
                schema: CartSchema,
            },
        ]),
        RedisModule,
    ],
    providers: [CartsRepository, CartsService],
    exports: [CartsService],
})
export class CartsModule {}
