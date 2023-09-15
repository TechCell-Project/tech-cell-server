import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(500)
    pageSize?: number;
}
