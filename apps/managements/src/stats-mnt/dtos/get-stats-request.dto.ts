import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsBooleanI18n, IsEnumI18n, IsNotEmptyI18n, IsDateStringI18n } from '~libs/common/i18n';
import { StatsSplitBy } from '../stats-mnt.enum';
import { isTrueSet } from '~libs/common';

export class GetStatsRequestDTO {
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
        required: true,
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
        required: false,
        description: 'Trigger refresh cache to recalculate revenue data',
    })
    @IsOptional()
    @Transform(({ value }) => isTrueSet(value))
    @IsBooleanI18n()
    refreshCache?: boolean;
}
