import { CategoriesModule } from '~libs/resource';
import { Module } from '@nestjs/common';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchController } from './categories-search.controller';

@Module({
    imports: [CategoriesModule, RedisModule],
    controllers: [CategoriesSearchController],
    providers: [RabbitMQService, CategoriesSearchService],
})
export class CategoriesSearchModule {}
