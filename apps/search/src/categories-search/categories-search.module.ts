import { CategoriesModule } from '~libs/resource';
import { Module } from '@nestjs/common';
import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchController } from './categories-search.controller';

@Module({
    imports: [CategoriesModule, RedisCacheModule],
    controllers: [CategoriesSearchController],
    providers: [RabbitMQService, CategoriesSearchService],
})
export class CategoriesSearchModule {}
