import { TCurrentUser } from '~libs/common/types';
import { Notification, NotificationService } from '~libs/resource/notifications';
import { Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { GetUserNotificationsDTO, OrderBy, ReadType } from '../dtos/get-user-notifications.dto';
import { ListDataResponseDTO, PaginationQuery } from '~libs/common/dtos';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationService: NotificationService) {}

    async getUserNotifications(user: TCurrentUser, requestQuery: GetUserNotificationsDTO) {
        const { readType, orderBy } = requestQuery;
        const query: FilterQuery<Notification> = {
            recipientId: typeof user._id === 'string' ? new Types.ObjectId(user._id) : user._id,
            ...(readType === ReadType.read && { readAt: { $ne: null } }),
            ...(readType === ReadType.unread && { readAt: null }),
        };

        const { page, pageSize } = new PaginationQuery(requestQuery);
        const options: QueryOptions<Notification> = {
            limit: pageSize,
            skip: (page - 1) * pageSize,
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
