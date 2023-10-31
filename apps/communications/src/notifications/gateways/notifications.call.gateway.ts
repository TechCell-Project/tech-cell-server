import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { AUTH_SERVICE } from '@app/common/constants/services.constant';
import { ClientRMQ } from '@nestjs/microservices';
import { NotificationService } from '@app/resource/notifications';
import { Order, User, UsersService } from '@app/resource';
import { NOTIFICATIONS_JOB_CREATE } from '../constants/notifications.constant';
import { UserRole } from '@app/resource/users/enums';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ICreateNotificationQueue, IPushNotifyToAllUserQueue } from '../interfaces';

@Injectable()
export class NotificationsCallGateway extends NotificationsGateway {
    constructor(
        @Inject(AUTH_SERVICE) protected readonly authService: ClientRMQ,
        @InjectQueue(NOTIFICATIONS_JOB_CREATE) protected notifyQueue: Queue,
        protected readonly notificationService: NotificationService,
        protected readonly usersService: UsersService,
    ) {
        super(authService, notificationService);
        this.logger = new Logger(NotificationsCallGateway.name);
    }

    public async pushNotifyToAllUser({
        title,
        body,
        data,
    }: {
        title: string;
        body: string;
        data: any;
    }) {
        const users = await this.usersService.getUsers({
            role: UserRole.User,
            isDeleted: false,
        });

        const [notifies] = await Promise.all(
            users.map((user) => {
                const dataToQueue: IPushNotifyToAllUserQueue = {
                    body,
                    title,
                    data,
                    userToNotify: user,
                };

                return this.notifyQueue.add(NOTIFICATIONS_JOB_CREATE, dataToQueue, {
                    jobId: `${Date.now()}_${dataToQueue.userToNotify._id}`,
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                });
            }),
        );

        return notifies;
    }

    public async newOrderCreated({ order, customer }: { order: Order; customer: User }) {
        const adminUsers = await this.usersService.getUsers({
            $or: [{ role: UserRole.SuperAdmin }, { role: UserRole.Admin }],
        });

        const [notifies] = await Promise.all(
            adminUsers.map((adminUser) =>
                this.notifyQueue.add(
                    NOTIFICATIONS_JOB_CREATE,
                    {
                        order,
                        userToNotify: adminUser,
                        customer,
                    } as ICreateNotificationQueue,
                    {
                        jobId: `${Date.now()}_${adminUser._id}`,
                        attempts: 5,
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        },
                    },
                ),
            ),
        );

        return notifies;
    }
}