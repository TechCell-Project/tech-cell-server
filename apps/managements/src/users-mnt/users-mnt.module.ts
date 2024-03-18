import { Module } from '@nestjs/common';
import { UsersModule } from '~libs/resource/users';
import { UsersMntController } from './users-mnt.controller';
import { UsersMntService } from './users-mnt.service';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQModule, RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '~libs/third-party';
import { OtpModule } from '~libs/resource';
import { COMMUNICATIONS_SERVICE } from '~libs/common';

@Module({
    imports: [
        RedisModule,
        UsersModule,
        OtpModule,
        RabbitMQModule,
        RabbitMQModule.registerRmq(
            COMMUNICATIONS_SERVICE,
            process.env.RABBITMQ_COMMUNICATIONS_QUEUE,
        ),
    ],
    controllers: [UsersMntController],
    providers: [RabbitMQService, UsersMntService, CloudinaryService],
})
export class UsersMntModule {}
