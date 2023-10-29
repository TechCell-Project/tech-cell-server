import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { CreateNotifyDTO } from './dtos';
import { ClientSession, FilterQuery, QueryOptions, Types, ProjectionType } from 'mongoose';
import { Notification } from '@app/resource/notifications';

@Injectable()
export class NotificationService {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async createNotification(notification: CreateNotifyDTO, session?: ClientSession) {
        return this.notificationRepository.create(notification, {}, session);
    }

    async getUserNotifications(
        query: FilterQuery<Notification>,
        options?: QueryOptions<Notification>,
        projection?: ProjectionType<Notification>,
    ) {
        return this.notificationRepository.find({
            filterQuery: query,
            queryOptions: options,
            projection: projection,
        });
    }

    async markNotificationAsRead(
        id: Types.ObjectId,
        session?: ClientSession,
    ): Promise<boolean | null> {
        const notification = await this.notificationRepository.findOne({
            _id: id,
        });
        if (!notification) {
            return null;
        }
        if (notification.readAt === null) {
            return !!(await this.notificationRepository.findOneAndUpdate(
                {
                    _id: id,
                },
                { readAt: new Date() },
                { session },
            ));
        }
        return !!notification;
    }
}
