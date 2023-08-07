import { CategoriesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchController } from './categories-search.controller';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        CategoriesModule,
        RedisCacheModule,
    ],
    controllers: [CategoriesSearchController],
    providers: [RabbitMQService, CategoriesSearchService],
})
export class CategoriesSearchModule {}
