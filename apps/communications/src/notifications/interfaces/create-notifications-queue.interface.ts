import { Order } from '@app/resource/orders';
import { User } from '@app/resource/users';

export interface ICreateNotificationQueue {
    order: Order;
    userToNotify: User;
    customer: User;
}
