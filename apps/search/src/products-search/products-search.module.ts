import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { AttributesModule, CategoriesModule } from '@app/resource';

@Module({
    imports: [ProductsModule, RedisCacheModule, AttributesModule, CategoriesModule],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
