import { Response } from 'express';
import { Controller, Res, Get } from '@nestjs/common';
import { NotificationsMessageSubscribe } from './notifications/constants/notifications.message';

@Controller('/')
export class CommunicationsController {
    @Get('/')
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
