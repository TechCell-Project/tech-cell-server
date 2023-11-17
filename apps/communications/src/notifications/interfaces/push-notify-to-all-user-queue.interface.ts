import { User } from '~libs/resource';

export interface IPushNotifyToAllUserQueue {
    userToNotify: User;
    title: string;
    body: string;
    data: any;
}
