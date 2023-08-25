import { RabbitMQService, RedisCacheModule } from '@app/common';
import { UsersModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { UsersSearchController } from './users-search.controller';
import { UsersSearchService } from './users-search.service';

@Module({
    imports: [RedisCacheModule, UsersModule],
    controllers: [UsersSearchController],
    providers: [RabbitMQService, UsersSearchService],
})
export class UsersSearchModule {}
