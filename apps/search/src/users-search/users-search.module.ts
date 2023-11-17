import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { UsersModule } from '@app/resource';
import { Logger, Module } from '@nestjs/common';
import { UsersSearchController } from './users-search.controller';
import { UsersSearchService } from './users-search.service';

@Module({
    imports: [RedisCacheModule, UsersModule],
    controllers: [UsersSearchController],
    providers: [RabbitMQService, UsersSearchService, Logger],
})
export class UsersSearchModule {}
