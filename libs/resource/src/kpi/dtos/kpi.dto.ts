import { Types } from 'mongoose';
import { Kpi } from '../schemas';
import { ApiProperty } from '@nestjs/swagger';
import { KpiStatusEnum, KpiTypeEnum } from '../enums';
import {
    IsDateI18n,
    IsEnumI18n,
    IsMongoIdI18n,
    IsNotEmptyI18n,
    IsNumberI18n,
    IsStringI18n,
} from '~libs/common/i18n';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class KpiDTO implements Readonly<Kpi> {
    @ApiProperty({
        required: true,
        type: String,
        format: 'ObjectId',
        description: 'KPI id',
        example: new Types.ObjectId().toString(),
    })
    @IsOptional()
    @IsMongoIdI18n()
    _id: Types.ObjectId;

    @ApiProperty({
        required: true,
        type: String,
        uniqueItems: true,
        description: 'KPI name',
        example: 'revenue month 12/2023',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    name: string;

    @ApiProperty({
        required: true,
        type: String,
        enum: KpiTypeEnum,
        description: 'KPI type',
        example: KpiTypeEnum.revenue,
    })
    @IsNotEmptyI18n()
    @IsEnumI18n(KpiTypeEnum)
    kpiType: string;

    @ApiProperty({
        required: true,
        type: Number,
        description: 'KPI value',
        minimum: Number.MIN_SAFE_INTEGER,
        maximum: Number.MAX_SAFE_INTEGER,
        example: 1000000,
    })
    @IsNotEmptyI18n()
    @IsNumberI18n()
    value: number;

    @ApiProperty({
        required: true,
        type: Date,
        description: 'KPI start date',
        example: new Date(),
    })
    @IsNotEmptyI18n()
    @IsDateI18n()
    @Type(() => Date)
    startDate: Date;

    @ApiProperty({
        required: true,
        type: Date,
        description: 'KPI end date',
        example: new Date(),
    })
    @IsNotEmptyI18n()
    @IsDateI18n()
    @Type(() => Date)
    endDate: Date;

    @ApiProperty({
        required: false,
        type: String,
        enum: KpiStatusEnum,
        description: 'KPI status',
    })
    @IsOptional()
    @IsEnumI18n(KpiStatusEnum)
    kpiStatus?: string;

    @ApiProperty({
        required: false,
        type: Date,
        description: 'KPI created date',
    })
    @IsOptional()
    @IsDateI18n()
    createdAt?: Date;

    @ApiProperty({
        required: false,
        type: Date,
        description: 'KPI updated date',
    })
    @IsOptional()
    @IsDateI18n()
    updatedAt?: Date;
}
