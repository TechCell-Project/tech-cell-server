import { User } from '@app/resource';

export interface IPushNotifyToAllUserQueue {
    userToNotify: User;
    title: string;
    body: string;
    data: any;
}
