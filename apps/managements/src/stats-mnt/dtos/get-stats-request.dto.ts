import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsBooleanI18n, IsEnumI18n, IsNotEmptyI18n, IsDateStringI18n } from '~libs/common/i18n';
import { StatsSplitBy } from '../stats-mnt.enum';
import { isTrueSet } from '~libs/common';
import { StatsType } from '../enums';
import { GetStatsOrdersRequestDTO } from './get-stats-orders-request.dto';

export class GetStatsRequestDTO extends IntersectionType(GetStatsOrdersRequestDTO) {
    @ApiProperty({
        required: true,
        description: 'From date to calculate revenue',
        format: 'date-time',
        type: String,
    })
    @IsNotEmptyI18n()
    @IsDateStringI18n()
    fromDate: string;

    @ApiProperty({
        required: false,
        description: 'To date to calculate revenue, default is today',
        default: new Date(),
        format: 'date-time',
        type: String,
    })
    @IsOptional()
    @IsDateStringI18n()
    toDate?: string;

    @ApiProperty({
        required: false,
        description: 'Split by day, month or year',
        enum: StatsSplitBy,
    })
    @IsOptional()
    @IsEnumI18n(StatsSplitBy)
    splitBy?: string;

    @ApiProperty({
        required: true,
        description: 'Type of stats',
        enum: StatsType,
        example: StatsType.Revenue,
    })
    @IsNotEmptyI18n()
    @IsEnumI18n(StatsType)
    type: StatsType;

    @ApiProperty({
        required: false,
        description: 'Trigger refresh cache to recalculate revenue data',
    })
    @IsOptional()
    @Transform(({ value }) => isTrueSet(value))
    @IsBooleanI18n()
    refreshCache?: boolean;
}
