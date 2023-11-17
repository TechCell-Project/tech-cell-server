import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongodbModule } from '~libs/common/database';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas';
import { NotificationRepository } from './notification.repository';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    ],
    providers: [NotificationService, NotificationRepository],
    exports: [NotificationService],
})
export class NotificationModule {}
