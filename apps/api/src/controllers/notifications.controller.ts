import { Controller, Get, Inject, UseGuards, Query } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { COMMUNICATIONS_SERVICE } from '@app/common/constants';
import { AuthGuard, catchException } from '@app/common';
import { GetUserNotificationsDTO, NotifyMessagePattern } from '~apps/communications/notifications';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Notification } from '@app/resource';

@UseGuards(AuthGuard)
@ApiTags('notifications')
@Controller('/notifications')
export class NotificationsController {
    constructor(
        @Inject(COMMUNICATIONS_SERVICE) private readonly communicationsService: ClientRMQ,
    ) {}

    @ApiOkResponse({ description: 'Get user notifications', type: [Notification] })
    @Get('/')
    async getUserNotifications(
        @Query() { ...query }: GetUserNotificationsDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return this.communicationsService
            .send(NotifyMessagePattern.getUsersNotifications, { user, query })
            .pipe(catchException());
    }
}
