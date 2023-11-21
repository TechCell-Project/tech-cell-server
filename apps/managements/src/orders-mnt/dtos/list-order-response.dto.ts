import { ListDataResponseDTO } from '~libs/common/dtos';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListOrderResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        description: 'Array of order response',
        type: [OrderSchemaDTO],
        example: OrderSchemaDTO,
    })
    data: OrderSchemaDTO[];
}
