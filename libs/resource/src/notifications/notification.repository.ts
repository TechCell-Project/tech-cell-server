import { AbstractRepository } from '~libs/resource/abstract';
import { Notification } from './schemas/notification.schema';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

export class NotificationRepository extends AbstractRepository<Notification> {
    protected readonly logger = new Logger(NotificationRepository.name);

    constructor(
        @InjectModel(Notification.name) notificationModel: Model<Notification>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(notificationModel, connection, i18n);
    }
}
