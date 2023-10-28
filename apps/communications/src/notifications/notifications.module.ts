import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { RabbitMQModule } from '@app/common/RabbitMQ';
import { AUTH_SERVICE } from '@app/common/constants';

@Module({
    imports: [RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE)],
    controllers: [NotificationsController],
    providers: [NotificationsGateway],
    exports: [NotificationsGateway],
})
export class NotificationsModule {}
