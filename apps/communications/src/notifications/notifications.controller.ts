import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotifyEventPattern, NotifyMessagePattern } from './constants/notifications.pattern';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { Order, User } from '~libs/resource';
import { NotificationsCallGateway } from './gateways';
import { NotificationsService } from './services';
import { TCurrentUser } from '~libs/common/types';
import { GetUserNotificationsDTO } from './dtos';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly rabbitmqService: RabbitMQService,
        private readonly notificationsCallGateway: NotificationsCallGateway,
        private readonly notificationsService: NotificationsService,
    ) {}

    /// MESSAGES ///
    @MessagePattern(NotifyMessagePattern.getUsersNotifications)
    async getUserNotifications(
        @Ctx() context: RmqContext,
        @Payload() { user, query }: { user: TCurrentUser; query: GetUserNotificationsDTO },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.notificationsService.getUserNotifications(user, query);
    }

    async pushNotifyToAllUser({ title, body, data }: { title: string; body: string; data: any }) {
        return this.notificationsCallGateway.pushNotifyToAllUser({ title, body, data });
    }

    /// EVENTS ///
    @EventPattern(NotifyEventPattern.newOrderCreated)
    async newOrderAdmin(
        @Ctx() context: RmqContext,
        @Payload() { order, customer }: { order: Order; customer: User },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        this.notificationsCallGateway.newOrderCreated({ order, customer });
    }
}
