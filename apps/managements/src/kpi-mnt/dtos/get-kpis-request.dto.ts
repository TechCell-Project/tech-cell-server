import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationQuery } from '~libs/common/dtos';
import { KpiDTO } from '~libs/resource/kpi';

export class GetKpisRequestDTO extends IntersectionType(
    PaginationQuery,
    PickType(KpiDTO, ['name', 'kpiType', 'startDate', 'endDate']),
) {
    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    kpiType: string;

    @ApiPropertyOptional()
    @IsOptional()
    startDate: Date;

    @ApiPropertyOptional()
    @IsOptional()
    endDate: Date;
}
