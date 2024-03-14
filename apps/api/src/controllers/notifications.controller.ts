import { Controller, Get, Inject, Query, Headers } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, COMMUNICATIONS_SERVICE } from '~libs/common/constants';
import { GetUserNotificationsDTO, NotifyMessagePattern } from '~apps/communications/notifications';
import { Auth, CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ListNotificationsResponseDTO } from '~libs/resource/notifications/dtos';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';
import { UserRole } from '~libs/resource/users/enums';

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
@Auth(UserRole.Manager, UserRole.Staff, UserRole.User)
@ApiTags('notifications')
@Controller('/notifications')
export class NotificationsController {
    constructor(
        @Inject(COMMUNICATIONS_SERVICE) private readonly communicationsService: ClientRMQ,
    ) {}

    @ApiOperation({ summary: "Get notifications's user" })
    @ApiOkResponse({ description: 'Get user notifications', type: ListNotificationsResponseDTO })
    @Get('/')
    async getUserNotifications(
        @Headers() headers: THeaders,
        @Query() { ...query }: GetUserNotificationsDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return sendMessagePipeException({
            client: this.communicationsService,
            pattern: NotifyMessagePattern.getUsersNotifications,
            data: { user, query },
            headers,
        });
    }
}
