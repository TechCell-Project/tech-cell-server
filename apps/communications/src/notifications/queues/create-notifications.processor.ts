import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATIONS_JOB_CREATE } from '../notifications.constant';
import { NotificationService, NotificationType } from '@app/resource/notifications';
import { UsersService } from '@app/resource/users';
import { NotificationsMessageSubscribe } from '../notifications.message';
import { NotificationsCallGateway } from '../notifications.call.gateway';
import { ICreateNotificationQueue } from '../interfaces';

@Injectable()
@Processor(NOTIFICATIONS_JOB_CREATE, {
    concurrency: 10,
    // limiter: {
    //     max: 2,
    //     duration: 60000,
    // },
})
export class CreateNotificationProcessor extends WorkerHost {
    private readonly logger = new Logger(CreateNotificationProcessor.name);

    constructor(
        protected readonly notificationService: NotificationService,
        protected readonly usersService: UsersService,
        @Inject(NotificationsCallGateway)
        protected readonly notificationsCallGateway: NotificationsCallGateway,
    ) {
        super();
    }

    async process(job: Job<ICreateNotificationQueue>) {
        const { order, userToNotify, customer } = job.data;

        try {
            const notifications = await this.notificationService.createNotification({
                recipientId: userToNotify._id.toString(),
                notificationType: NotificationType.newOrder,
                content: `${customer?.userName} đã đặt đơn hàng mới #${order?._id}`,
                data: {
                    order,
                },
            });

            return this.notificationsCallGateway.server
                .to([`user_id_${userToNotify._id}`])
                .emit(NotificationsMessageSubscribe.NewOrderAdmin, {
                    time: Date.now().toString(),
                    notifications,
                });
        } catch (error) {
            this.logger.error(error);
        }
    }
}
