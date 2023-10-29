import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotifyEventPattern } from './notifications.pattern';
import { RabbitMQService } from '@app/common/RabbitMQ/services';
import { Order, User } from '@app/resource';
import { NotificationsCallGateway } from './notifications.call.gateway';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly rabbitmqService: RabbitMQService,
        private readonly notificationsCallGateway: NotificationsCallGateway,
    ) {}

    @EventPattern(NotifyEventPattern.newOrderCreated)
    async newOrderAdmin(
        @Ctx() context: RmqContext,
        @Payload() { order, customer }: { order: Order; customer: User },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        this.notificationsCallGateway.newOrderCreated({ order, customer });
    }

    async pushNotifyToAllUser({ title, body, data }: { title: string; body: string; data: any }) {
        return this.notificationsCallGateway.pushNotifyToAllUser({ title, body, data });
    }
}
