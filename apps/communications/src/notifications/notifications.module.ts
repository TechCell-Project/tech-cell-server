import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { RabbitMQModule } from '~libs/common/RabbitMQ';
import { AUTH_SERVICE } from '~libs/common/constants';
import { NotificationModule } from '~libs/resource/notifications';
import { NotificationsCallGateway } from './gateways';
import { UsersModule } from '~libs/resource';
import { BullMqModule } from '~libs/common';
import { BullModule } from '@nestjs/bullmq';
import {
    NOTIFICATIONS_PREFIX,
    NOTIFICATIONS_JOB_CREATE,
    NOTIFICATIONS_JOB_PUSH_ALL,
} from './constants';
import { CreateNotificationProcessor, PushNotifyToAllUserProcessor } from './queues';
import { NotificationsService } from './services';
import { RedisModule } from '~libs/common/Redis';

@Module({
    imports: [
        RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
        NotificationModule,
        UsersModule,
        BullMqModule,
        BullModule.registerQueue({
            prefix: NOTIFICATIONS_PREFIX,
            name: NOTIFICATIONS_JOB_CREATE,
        }),
        BullModule.registerQueue({
            prefix: NOTIFICATIONS_PREFIX,
            name: NOTIFICATIONS_JOB_PUSH_ALL,
        }),
        RedisModule.register({
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
        }),
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
        NotificationsCallGateway,
        CreateNotificationProcessor,
        PushNotifyToAllUserProcessor,
    ],
    exports: [NotificationsCallGateway],
})
export class NotificationsModule {}
