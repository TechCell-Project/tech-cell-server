import { Module } from '@nestjs/common';
import { ProductsSearchController } from './products-search.controller';
import { RabbitMQModule } from '@app/common';
import { ProductsSearchService } from './products-search.service';
import { ProductsModule } from '@app/resource';

@Module({
    imports: [RabbitMQModule, ProductsModule],
    controllers: [ProductsSearchController],
    providers: [ProductsSearchService],
})
export class ProductsSearchModule {}
