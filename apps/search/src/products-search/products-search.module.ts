import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { AttributesModule, CategoriesModule } from '@app/resource';

@Module({
    imports: [ProductsModule, RedisCacheModule, AttributesModule, CategoriesModule],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
