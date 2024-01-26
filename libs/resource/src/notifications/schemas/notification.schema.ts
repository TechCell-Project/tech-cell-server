import { AbstractDocument } from '~libs/resource/abstract';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotificationType } from '../enums';
import { SYSTEM_ISSUER } from '../notifications.constant';
import { Types } from 'mongoose';

export class NotifyData {
    [key: string]: any;
}

@Schema({ timestamps: true })
export class Notification extends AbstractDocument {
    @Prop({ required: true, enum: NotificationType, type: String })
    notificationType: string;

    @Prop({ required: false, default: null, ref: 'User' })
    recipientId?: Types.ObjectId | null;

    @Prop({ required: false, default: SYSTEM_ISSUER })
    issuerId?: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: false, default: {} })
    data?: NotifyData;

    @Prop({ required: false, default: null })
    readAt?: Date | null;

    @Prop({ required: false, default: null })
    canceledAt?: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

NotificationSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

NotificationSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
