import { IsOptional } from 'class-validator';

export class GetProductsDTO {
    @IsOptional()
    all?: boolean;

    @IsOptional()
    limit?: number;

    @IsOptional()
    offset?: number;

    @IsOptional()
    sort?: string;

    @IsOptional()
    order?: string;

    @IsOptional()
    search?: string;

    @IsOptional()
    status?: number;
}
