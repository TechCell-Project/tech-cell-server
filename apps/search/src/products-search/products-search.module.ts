import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '@app/resource/products';
import { ProductsSearchController } from './products-search.controller';
import { ProductsSearchService } from './products-search.service';
import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        ProductsModule,
        RedisCacheModule,
    ],
    controllers: [ProductsSearchController],
    providers: [RabbitMQService, ProductsSearchService],
})
export class ProductsSearchModule {}
