import { Module } from '@nestjs/common';
import { ProductsModule } from '~libs/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule, CategoriesModule } from '~libs/resource';

@Module({
    imports: [ProductsModule, RedisModule, AttributesModule, CategoriesModule],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
