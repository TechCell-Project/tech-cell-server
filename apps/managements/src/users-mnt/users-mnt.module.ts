import { Module } from '@nestjs/common';
import { UsersModule } from '@app/resource/users';
import { UsersMntController } from './users-mnt.controller';
import { UsersMntService } from './users-mnt.service';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CloudinaryService } from '@app/third-party';

@Module({
    imports: [RedisCacheModule, UsersModule],
    controllers: [UsersMntController],
    providers: [RabbitMQService, UsersMntService, CloudinaryService],
})
export class UsersMntModule {}
