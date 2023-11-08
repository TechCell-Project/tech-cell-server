import { ListDataResponseDTO } from '@app/common/dtos/list-data-response.dto';
import { UserMntResponseDTO } from '@app/resource/users/dtos/user-mnt-response.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListUserResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [UserMntResponseDTO],
        description: 'List of users',
        example: UserMntResponseDTO,
    })
    data: UserMntResponseDTO[];
}
