import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { AttributesSearchController } from './attributes-search.controller';
import { AttributesSearchService } from './attributes-search.service';

@Module({
    imports: [AttributesModule, RedisCacheModule],
    controllers: [AttributesSearchController],
    providers: [RabbitMQService, AttributesSearchService],
})
export class AttributesSearchModule {}
