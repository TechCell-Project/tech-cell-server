import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsEnumI18n } from '~libs/common/i18n';
import { GetStatsRequestDTO } from './get-stats-request.dto';
import { StatsGetBy } from '../enums';

export class GetStatsOrdersApiRequestDTO extends IntersectionType(
    PickType(GetStatsRequestDTO, ['fromDate', 'toDate', 'refreshCache']),
) {
    // @ApiProperty({
    //     required: false,
    //     description: 'Status of type to get stats',
    //     enum: OrderStatusEnum,
    //     example: OrderStatusEnum.COMPLETED,
    // })
    // @IsOptional()
    // @IsEnumI18n(OrderStatusEnum)
    // orderStatus: OrderStatusEnum;

    @ApiProperty({
        required: false,
        description: 'Get stats by field, default is createdAt',
        enum: StatsGetBy,
        example: StatsGetBy.createdAt,
        default: StatsGetBy.createdAt,
    })
    @IsOptional()
    @IsEnumI18n(StatsGetBy)
    getBy?: StatsGetBy;
}
