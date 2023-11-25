import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { UsersModule } from '~libs/resource';
import { Logger, Module } from '@nestjs/common';
import { UsersSearchController } from './users-search.controller';
import { UsersSearchService } from './users-search.service';

@Module({
    imports: [RedisModule, UsersModule],
    controllers: [UsersSearchController],
    providers: [RabbitMQService, UsersSearchService, Logger],
})
export class UsersSearchModule {}
