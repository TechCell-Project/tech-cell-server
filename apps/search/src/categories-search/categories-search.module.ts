import { CategoriesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchController } from './categories-search.controller';

@Module({
    imports: [CategoriesModule, RedisCacheModule],
    controllers: [CategoriesSearchController],
    providers: [RabbitMQService, CategoriesSearchService],
})
export class CategoriesSearchModule {}
