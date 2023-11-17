import { ListDataResponseDTO } from '~libs/common/dtos/list-data-response.dto';
import { CategoryDTO } from '@app/resource/categories/dtos';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListCategoryResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [CategoryDTO],
        description: 'List of categories',
        example: CategoryDTO,
    })
    data: CategoryDTO[];
}
