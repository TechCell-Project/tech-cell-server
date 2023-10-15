import { Module } from '@nestjs/common';
import { UsersModule } from '@app/resource/users';
import { UsersMntController } from './users-mnt.controller';
import { UsersMntService } from './users-mnt.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { CloudinaryService } from '@app/third-party';

@Module({
    imports: [RedisCacheModule, UsersModule],
    controllers: [UsersMntController],
    providers: [RabbitMQService, UsersMntService, CloudinaryService],
})
export class UsersMntModule {}
