import { Module } from '@nestjs/common';
import { ProductsModule } from '~libs/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule, CategoriesModule, UsersModule } from '~libs/resource';
import { I18nModule } from '~libs/common';

@Module({
    imports: [
        ProductsModule,
        RedisModule,
        AttributesModule,
        CategoriesModule,
        UsersModule,
        I18nModule,
    ],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
