import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsBooleanI18n, IsDateI18n, IsEnumI18n } from '~libs/common/i18n';
import { StatsSplitBy } from '../stats-mnt.enum';
import { isTrueSet } from '~libs/common';

export class GetStatsRequestDTO {
    @ApiProperty({
        required: false,
        description: 'From date to calculate revenue',
        format: 'date-time',
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => new Date(value))
    @IsDateI18n()
    fromDate?: Date;

    @ApiProperty({
        required: false,
        description: 'To date to calculate revenue',
        format: 'date-time',
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => new Date(value))
    @IsDateI18n()
    toDate?: Date;

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
