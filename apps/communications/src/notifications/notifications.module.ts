import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { RabbitMQModule } from '@app/common/RabbitMQ';
import { AUTH_SERVICE } from '@app/common/constants';
import { NotificationModule } from '@app/resource/notifications';
import { NotificationsCallGateway } from './notifications.call.gateway';
import { UsersModule } from '@app/resource';
import { BullMqModule } from '@app/common';
import { BullModule } from '@nestjs/bullmq';
import {
    NOTIFICATIONS_PREFIX,
    NOTIFICATIONS_JOB_CREATE,
    NOTIFICATIONS_JOB_PUSH_ALL,
} from './notifications.constant';
import { CreateNotificationProcessor, PushNotifyToAllUserProcessor } from './queues';

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
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsCallGateway,
        CreateNotificationProcessor,
        PushNotifyToAllUserProcessor,
    ],
    exports: [NotificationsCallGateway],
})
export class NotificationsModule {}
