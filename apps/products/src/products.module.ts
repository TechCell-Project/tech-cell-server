import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { RabbitMQModule, RabbitMQService, MongodbModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsRepository } from './products.repository';
// import { ValidationModule } from '@app/common';

@Module({
    imports: [
        RabbitMQModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    controllers: [ProductsController],
    providers: [RabbitMQService, ProductsService, ProductsRepository],
})
export class ProductsModule {}
