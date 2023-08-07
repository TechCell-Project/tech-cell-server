import { IsOptional } from 'class-validator';

export class QueryProductParamsDTO {
    @IsOptional()
    name?: string;

    @IsOptional()
    all?: boolean;

    @IsOptional()
    limit?: number;

    @IsOptional()
    offset?: number;
}
