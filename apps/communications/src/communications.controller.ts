import { Response } from 'express';
import { Controller, Res, Get } from '@nestjs/common';
import { NotificationsMessageSubscribe } from './notifications/constants/notifications.message';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CommunicationsMessagePattern } from './communications.pattern';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { CommunicationsHealthIndicator } from './communications.health';

@Controller('/')
export class CommunicationsController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly communicationsHealthIndicator: CommunicationsHealthIndicator,
    ) {}

    @MessagePattern(CommunicationsMessagePattern.isHealthy)
    async isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.communicationsHealthIndicator.isHealthy(key);
    }

    @Get('/ping')
    async ping(@Res() res: Response) {
        res.json({
            message: 'pong',
            availableRoutes: ['/ping', '/notifications'],
        });
    }

    @Get('/notifications')
    async getNotifications(@Res() res: Response) {
        res.json({
            message: 'Notifications endpoint',
            allMessage: Object.values(NotificationsMessageSubscribe).join(', '),
        });
    }
}
