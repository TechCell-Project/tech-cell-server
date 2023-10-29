import { TCurrentUser } from '@app/common/types';
import { NotificationService } from '@app/resource/notifications';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { GetUserNotificationsDTO, ReadType } from '../dtos/get-user-notifications.dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationService: NotificationService) {}

    async getUserNotifications(
        user: TCurrentUser,
        { page, pageSize, readType }: GetUserNotificationsDTO,
    ) {
        const query = {
            recipientId: new Types.ObjectId(user._id),
            ...(readType === ReadType.read && { readAt: { $ne: null } }),
            ...(readType === ReadType.unread && { readAt: null }),
        };
        const options = {
            limit: pageSize,
            skip: page * pageSize,
        };

        return await this.notificationService.getUserNotifications(query, options);
    }
}
