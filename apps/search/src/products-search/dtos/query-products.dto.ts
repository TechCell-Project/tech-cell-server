import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryProductParamsDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    @Transform(({ value }) => value === 'true')
    all?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pageSize?: number;
}
