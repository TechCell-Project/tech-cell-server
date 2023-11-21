import { Order } from '~libs/resource/orders';
import { User } from '~libs/resource/users';

export interface ICreateNotificationQueue {
    order: Order;
    userToNotify: User;
    customer: User;
}
