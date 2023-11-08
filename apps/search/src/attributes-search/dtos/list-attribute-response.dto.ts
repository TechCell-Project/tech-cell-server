import { ListDataResponseDTO } from '@app/common/dtos/list-data-response.dto';
import { AttributeDTO } from '@app/resource/attributes/dtos';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListAttributeResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [AttributeDTO],
        description: 'List of attributes',
        example: AttributeDTO,
    })
    data: AttributeDTO[];
}
