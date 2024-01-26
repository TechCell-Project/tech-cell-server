import { Types } from 'mongoose';
import { NotificationType } from '../enums';
import { NotifyData, Notification } from '../schemas';

export class CreateNotifyDTO implements Omit<Notification, '_id'> {
    notificationType: NotificationType;
    recipientId?: Types.ObjectId | null;
    issuerId?: string;
    content: string;
    data?: NotifyData;
}
