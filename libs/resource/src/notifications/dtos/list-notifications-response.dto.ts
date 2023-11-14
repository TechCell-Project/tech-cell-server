import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListDataResponseDTO } from '@app/common/dtos/list-data-response.dto';
import { NotificationsDTO } from './notifications.dto';

export class ListNotificationsResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [NotificationsDTO],
        description: 'List of users',
        example: NotificationsDTO,
    })
    data: NotificationsDTO[];
}
