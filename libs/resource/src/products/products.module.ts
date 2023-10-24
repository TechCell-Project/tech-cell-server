import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MongodbModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsRepository } from './products.repository';
import { RedisModule } from '@app/common/Redis';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        RedisModule.register({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        }),
    ],
    controllers: [],
    providers: [ProductsService, ProductsRepository],
    exports: [ProductsService],
})
export class ProductsModule {}
