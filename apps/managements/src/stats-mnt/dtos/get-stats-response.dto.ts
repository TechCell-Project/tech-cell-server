import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { TCalculate } from '~libs/resource/statistics/types';
import { GetStatsRequestDTO } from './get-stats-request.dto';

class GetStatsDataDTO implements TCalculate {
    @ApiProperty({
        required: false,
        description: 'total of orders in a period of time',
        example: 3,
    })
    orders: number;

    @ApiProperty({
        required: false,
        description: 'total revenue in a period of time',
        example: 1000000,
    })
    revenue: number;

    @ApiProperty({
        required: false,
        description: 'current stats date',
        example: new Date(2023, 10, 10),
    })
    date: Date;

    @ApiProperty({
        required: false,
        description: 'current stats date in string',
        example: '2023-10-10',
    })
    dateString: string;
}

export class GetStatsResponseDTO extends IntersectionType(
    PickType(GetStatsRequestDTO, ['fromDate', 'toDate']),
) {
    @ApiProperty({
        required: false,
        description: 'Total of orders in range of time',
        example: 3,
    })
    totalOrders: number;

    @ApiProperty({
        required: false,
        description: 'Total revenue in range of time',
        example: 1000000,
    })
    totalRevenue: number;
    @ApiProperty({
        required: false,
        description: 'Data of statistics',
        type: [GetStatsDataDTO],
        example: GetStatsDataDTO,
    })
    data: GetStatsDataDTO[];
}
