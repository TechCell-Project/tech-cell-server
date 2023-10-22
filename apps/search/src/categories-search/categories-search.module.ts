import { CategoriesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchController } from './categories-search.controller';

@Module({
    imports: [CategoriesModule, RedisCacheModule],
    controllers: [CategoriesSearchController],
    providers: [RabbitMQService, CategoriesSearchService],
})
export class CategoriesSearchModule {}
