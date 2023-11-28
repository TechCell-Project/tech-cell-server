import { Types } from 'mongoose';
import { Notification } from '../schemas';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enums';

export class NotificationsDTO implements Notification {
    @ApiProperty({
        type: String,
        required: true,
        format: 'ObjectId',
        example: '5f9d4e9d8e5a2b1f3c916d0a',
    })
    _id: Types.ObjectId;

    @ApiProperty({
        type: String,
        required: true,
        enum: NotificationType,
        example: NotificationType.newOrder,
    })
    notificationType: string;

    @ApiProperty({
        type: String,
        required: false,
        format: 'ObjectId',
        example: '5f9d4e9d8e5a2b1f3c916d0a',
    })
    recipientId?: Types.ObjectId;

    @ApiProperty({
        type: String,
        required: false,
        example: '5f9d4e9d8e5a2b1f3c916d0a',
        description: 'The issuer of the notification',
    })
    issuerId?: string;

    @ApiProperty({
        type: String,
        required: true,
        example: 'This is a content of notification',
    })
    content: string;

    @ApiProperty({
        type: Object,
        required: false,
        example: {},
    })
    data?: any;

    @ApiProperty({
        type: Date,
        required: false,
        example: new Date(),
        description: 'The date when the notification is read, null if not read',
    })
    readAt?: Date | null;

    @ApiProperty({
        type: Date,
        required: false,
        example: new Date(),
    })
    canceledAt?: Date | null;

    @ApiProperty({
        type: Date,
        required: false,
        example: new Date(),
    })
    updatedAt?: Date;

    @ApiProperty({
        type: Date,
        required: false,
        example: new Date(),
    })
    createdAt?: Date;
}
