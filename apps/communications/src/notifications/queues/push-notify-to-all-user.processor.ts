import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATIONS_JOB_PUSH_ALL } from '../constants/notifications.constant';
import { NotificationService, NotificationType } from '~libs/resource/notifications';
import { UsersService } from '~libs/resource/users';
import { NotificationsMessageSubscribe } from '../constants/notifications.message';
import { NotificationsCallGateway } from '../gateways/notifications.call.gateway';
import { IPushNotifyToAllUserQueue } from '../interfaces';
import { convertToObjectId } from '~libs/common/utils';

@Injectable()
@Processor(NOTIFICATIONS_JOB_PUSH_ALL, {
    // The concurrency option specifies how many jobs this processor can handle concurrently.
    // In this case, it can handle up to 100 jobs at the same time.
    concurrency: 50,
    // The limiter option is used to rate limit the job processing.
    // In this case, the processor can handle a maximum of 100 jobs per 10,000 milliseconds (or 10 seconds).
    limiter: {
        max: 200,
        duration: 5000,
    },
})
export class PushNotifyToAllUserProcessor extends WorkerHost {
    private readonly logger = new Logger(PushNotifyToAllUserProcessor.name);

    constructor(
        protected readonly notificationService: NotificationService,
        protected readonly usersService: UsersService,
        @Inject(NotificationsCallGateway)
        protected readonly notificationsCallGateway: NotificationsCallGateway,
    ) {
        super();
    }

    async process(job: Job<IPushNotifyToAllUserQueue>) {
        const { title, body, data, userToNotify } = job.data;

        try {
            const notifications = await this.notificationService.createNotification({
                recipientId: convertToObjectId(userToNotify._id),
                notificationType: NotificationType.newOrder,
                content: body,
                data: {
                    title,
                    data,
                },
            });

            return this.notificationsCallGateway.socketServer
                .to([`user_id_${userToNotify._id}`])
                .emit(NotificationsMessageSubscribe.NewOrderAdmin, {
                    notifications,
                });
        } catch (error) {
            this.logger.error(error);
        }
    }
}
