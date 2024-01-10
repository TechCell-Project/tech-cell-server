import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATIONS_JOB_CREATE } from '../constants/notifications.constant';
import { NotificationService, NotificationType } from '~libs/resource/notifications';
import { UsersService } from '~libs/resource/users';
import { NotificationsMessageSubscribe } from '../constants/notifications.message';
import { NotificationsCallGateway } from '../gateways/notifications.call.gateway';
import { ICreateNotificationQueue } from '../interfaces';
import { cleanUserBeforeResponse } from '~libs/resource/users/utils/user.util';
import { Types } from 'mongoose';

@Injectable()
// The @Processor decorator marks the class as a job processor.
// The job processor is responsible for processing jobs of a certain type.
@Processor(NOTIFICATIONS_JOB_CREATE, {
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
                recipientId:
                    typeof userToNotify._id === 'string'
                        ? new Types.ObjectId(userToNotify._id)
                        : userToNotify._id,
                notificationType: NotificationType.newOrder,
                content: `${customer.userName ?? order.userId} đã đặt đơn hàng mới #${order?._id}`,
                data: {
                    order,
                    customer: cleanUserBeforeResponse(customer),
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
