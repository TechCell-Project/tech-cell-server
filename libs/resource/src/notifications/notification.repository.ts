import { AbstractRepository } from '~libs/resource/abstract';
import { Notification } from './schemas/notification.schema';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

export class NotificationRepository extends AbstractRepository<Notification> {
    protected readonly logger = new Logger(NotificationRepository.name);

    constructor(
        @InjectModel(Notification.name) notificationModel: Model<Notification>,
        @InjectConnection() connection: Connection,
    ) {
        super(notificationModel, connection);
    }
}
