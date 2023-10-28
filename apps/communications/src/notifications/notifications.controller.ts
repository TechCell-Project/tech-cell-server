import { Controller, Get } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { MessagePattern } from '@nestjs/microservices';
import { NotifyEventPattern } from './notifications.pattern';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsGateway: NotificationsGateway) {}

    @Get('/')
    @MessagePattern(NotifyEventPattern.newOrderAdmin)
    async newOrderAdmin(data: any) {
        return this.notificationsGateway.newOrderAdmin(data);
    }
}
