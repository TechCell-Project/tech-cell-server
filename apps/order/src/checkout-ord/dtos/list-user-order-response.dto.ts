import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos';

export class ListUserOrderResponseDTO extends IntersectionType(ListDataResponseDTO) {
    constructor(data: ListUserOrderResponseDTO) {
        super(data);
        this.data = data.data;
    }

    @ApiProperty({
        description: 'List user orders',
        type: [OrderSchemaDTO],
        example: OrderSchemaDTO,
    })
    data: OrderSchemaDTO[];
}
