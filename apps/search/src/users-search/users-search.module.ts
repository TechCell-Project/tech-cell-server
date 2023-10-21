import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
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
