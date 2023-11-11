import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { CreateNotifyDTO } from './dtos';
import { ClientSession, FilterQuery, QueryOptions, ProjectionType } from 'mongoose';
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
        query: FilterQuery<Notification>,
        options?: QueryOptions<Notification>,
        session?: ClientSession,
    ): Promise<boolean | null> {
        try {
            const notification = await this.notificationRepository.findOne(query);
            if (!notification) {
                return null;
            }
            if (notification.readAt === null) {
                return !!(await this.notificationRepository.findOneAndUpdate(
                    query,
                    { readAt: new Date() },
                    options,
                    session,
                ));
            }
            return !!notification;
        } catch (error) {
            return false;
        }
    }
}
