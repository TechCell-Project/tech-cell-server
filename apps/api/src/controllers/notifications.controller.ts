import { Controller, Get, Inject, UseGuards, Query } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, COMMUNICATIONS_SERVICE } from '@app/common/constants';
import { AuthGuard, catchException } from '@app/common';
import { GetUserNotificationsDTO, NotifyMessagePattern } from '~apps/communications/notifications';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ListNotificationsResponseDTO, NotificationsDTO } from '@app/resource/notifications/dtos';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiUnauthorizedResponse({
    description: 'Unauthorized, please login!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@UseGuards(AuthGuard)
@ApiTags('notifications')
@Controller('/notifications')
export class NotificationsController {
    constructor(
        @Inject(COMMUNICATIONS_SERVICE) private readonly communicationsService: ClientRMQ,
    ) {}

    @ApiOkResponse({ description: 'Get user notifications', type: ListNotificationsResponseDTO })
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
