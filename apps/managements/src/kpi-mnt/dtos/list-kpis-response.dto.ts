import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { KpiDTO } from '~libs/resource/kpi';

export class ListKpisResponseDTO extends IntersectionType(ListDataResponseDTO) {
    constructor(data: ListKpisResponseDTO) {
        super();
        Object.assign(this, data);
        this.data = data?.data;
    }

    @ApiProperty({
        type: [KpiDTO],
        description: 'List of kpis',
    })
    data: KpiDTO[];
}
