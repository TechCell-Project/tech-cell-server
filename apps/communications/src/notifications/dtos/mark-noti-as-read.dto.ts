import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Message } from './class.dto';

export class NotificationId {
    @ApiProperty({
        example: '5f9b8f7b9b8f7b9b8f7b9b8f',
    })
    notificationId: string;
}

export class MarkNotificationAsRead extends Message<NotificationId> {
    @ApiProperty({
        oneOf: [{ $ref: getSchemaPath(NotificationId) }],
    })
    payload: NotificationId;
}
