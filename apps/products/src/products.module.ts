import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './services';

import { RabbitMQModule, RabbitMQService, MongodbModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductRepository } from './products.repository';
import { ValidationModule } from '@app/common';

@Module({
    imports: [
        RabbitMQModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    controllers: [ProductsController],
    providers: [RabbitMQService, ProductsService, ValidationModule, ProductRepository],
})
export class ProductsModule {}
