import { ListDataResponseDTO } from '~libs/common/dtos/list-data-response.dto';
import { ProductDTO } from '@app/resource/products/dtos/product.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListProductResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        type: [ProductDTO],
        description: 'List of categories',
        example: ProductDTO,
    })
    data: ProductDTO[];
}
