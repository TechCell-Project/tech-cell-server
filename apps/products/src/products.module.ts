import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { RabbitMQModule, RabbitMQService } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './validation.pipe';

@Module({
    imports: [
        RabbitMQModule,
        MongooseModule.forRoot(process.env.MONGODB_PRODUCTS_URI),
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    controllers: [ProductsController],
    providers: [
        RabbitMQService,
        ProductsService,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ],
})
export class ProductsModule {}
