import { Module } from '@nestjs/common';
import { UsersModule } from '~libs/resource/users';
import { UsersMntController } from './users-mnt.controller';
import { UsersMntService } from './users-mnt.service';
import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '~libs/third-party';

@Module({
    imports: [RedisCacheModule, UsersModule],
    controllers: [UsersMntController],
    providers: [RabbitMQService, UsersMntService, CloudinaryService],
})
export class UsersMntModule {}
