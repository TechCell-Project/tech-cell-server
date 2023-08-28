import { MongodbModule } from '@app/common';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas';
import { CartsRepository } from './carts.repository';
import { CartsService } from './carts.service';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([
            {
                name: Cart.name,
                schema: CartSchema,
            },
        ]),
    ],
    providers: [CartsRepository, CartsService],
    exports: [CartsService],
})
export class CartsModule {}
