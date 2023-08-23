import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';

@Module({
    imports: [ProductsModule, RedisCacheModule],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
