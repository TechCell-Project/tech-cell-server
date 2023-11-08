import { ListDataResponseDTO } from '@app/common/dtos';
import { OrderSchemaDTO } from '@app/resource/orders/dtos/order-schema.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class ListOrderResponseDTO extends IntersectionType(ListDataResponseDTO) {
    @ApiProperty({
        description: 'Array of order response',
        type: [OrderSchemaDTO],
        example: OrderSchemaDTO,
    })
    data: OrderSchemaDTO[];
}
