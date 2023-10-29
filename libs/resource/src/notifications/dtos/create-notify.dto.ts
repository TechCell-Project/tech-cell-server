import { NotificationType } from '../enums';
import { NotifyData, Notification } from '../schemas';

export class CreateNotifyDTO implements Omit<Notification, '_id'> {
    notificationType: NotificationType;
    recipientId?: string;
    issuerId?: string;
    content: string;
    data?: NotifyData;
}
