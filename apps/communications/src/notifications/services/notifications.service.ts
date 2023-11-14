import { TCurrentUser } from '@app/common/types';
import { Notification, NotificationService } from '@app/resource/notifications';
import { Injectable } from '@nestjs/common';
import { QueryOptions, Types } from 'mongoose';
import { GetUserNotificationsDTO, OrderBy, ReadType } from '../dtos/get-user-notifications.dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationService: NotificationService) {}

    async getUserNotifications(
        user: TCurrentUser,
        { page, pageSize, readType, orderBy }: GetUserNotificationsDTO,
    ) {
        const query = {
            recipientId: new Types.ObjectId(user._id),
            ...(readType === ReadType.read && { readAt: { $ne: null } }),
            ...(readType === ReadType.unread && { readAt: null }),
        };
        const options: QueryOptions<Notification> = {
            limit: pageSize,
            skip: page * pageSize,
        };

        if (orderBy === OrderBy.oldest) {
            options.sort = { createdAt: 1 };
        } else {
            options.sort = { createdAt: -1 };
        }

        return await this.notificationService.getUserNotifications(query, options);
    }
}
