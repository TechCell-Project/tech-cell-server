import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';

import { RabbitMQModule, RabbitMQService, MongodbModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsRepository } from './products.repository';

@Module({
    imports: [
        RabbitMQModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    providers: [RabbitMQService, ProductsService, ProductsRepository],
    exports: [ProductsService],
})
export class ProductsModule {}
