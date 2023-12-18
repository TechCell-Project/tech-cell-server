import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { KpiDTO } from '~libs/resource/kpi';

export class UpdateKpiRequestDTO extends OmitType(KpiDTO, [
    '_id',
    'createdAt',
    'updatedAt',
    'kpiType',
]) {
    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    startDate: Date;

    @ApiPropertyOptional()
    @IsOptional()
    endDate: Date;

    @ApiPropertyOptional()
    @IsOptional()
    value: number;

    @ApiPropertyOptional()
    @IsOptional()
    kpiStatus?: string;
}
