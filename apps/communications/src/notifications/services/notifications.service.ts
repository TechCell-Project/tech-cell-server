import { TCurrentUser } from '~libs/common/types';
import { Notification, NotificationService } from '@app/resource/notifications';
import { Injectable } from '@nestjs/common';
import { QueryOptions, Types } from 'mongoose';
import { GetUserNotificationsDTO, OrderBy, ReadType } from '../dtos/get-user-notifications.dto';
import { ListDataResponseDTO } from '~libs/common/dtos';

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

        const [notifies, totalRecord] = await Promise.all([
            this.notificationService.getUserNotifications(query, options),
            this.notificationService.countUserNotifications(query),
        ]);

        const totalPage = Math.ceil(totalRecord / pageSize);
        return new ListDataResponseDTO<Notification>({
            page,
            pageSize,
            totalPage,
            totalRecord,
            data: notifies,
        });
    }
}
