import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsByCateRequestDTO {
    @IsString()
    category: string;

    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page: number;

    @IsString()
    sortField: string;

    @IsEnum(['asc', 'desc'])
    sortOrder: 'asc' | 'desc';
}
