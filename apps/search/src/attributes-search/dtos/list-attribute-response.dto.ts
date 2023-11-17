import { ListDataResponseDTO } from '~libs/common/dtos/list-data-response.dto';
import { AttributeDTO } from '~libs/resource/attributes/dtos';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListAttributeResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [AttributeDTO],
        description: 'List of attributes',
        example: AttributeDTO,
    })
    data: AttributeDTO[];
}
