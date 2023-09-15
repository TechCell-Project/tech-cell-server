import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_CATEGORY_PER_PAGE } from '~/constants/category.constant';

export class GetCategoriesRequestDTO {
    @ApiProperty({
        required: false,
        type: Number,
        default: 1,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        required: false,
        type: Number,
        default: 10,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(MAX_CATEGORY_PER_PAGE)
    pageSize?: number;

    @ApiProperty({
        type: String,
        description: 'Keyword to search',
        required: false,
    })
    @IsOptional()
    @IsString()
    keyword?: string;
}
