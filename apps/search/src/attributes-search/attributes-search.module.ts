import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule } from '~libs/resource';
import { Module } from '@nestjs/common';
import { AttributesSearchController } from './attributes-search.controller';
import { AttributesSearchService } from './attributes-search.service';

@Module({
    imports: [AttributesModule, RedisModule],
    controllers: [AttributesSearchController],
    providers: [RabbitMQService, AttributesSearchService],
})
export class AttributesSearchModule {}
