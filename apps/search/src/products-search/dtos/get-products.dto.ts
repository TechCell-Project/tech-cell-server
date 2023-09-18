import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_PRODUCTS_PER_PAGE } from '~/constants/product.constant';
import { Transform, Type } from 'class-transformer';

export class GetProductsDTO {
    @ApiProperty({
        type: Number,
        description: 'Page of products to be returned',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(MAX_PRODUCTS_PER_PAGE)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Size of page for products to be returned',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(MAX_PRODUCTS_PER_PAGE)
    pageSize?: number;

    @ApiProperty({
        type: Boolean,
        description: 'Get detail of products',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    detail?: boolean;

    @ApiProperty({
        type: String,
        description: 'Keyword to search',
        required: false,
    })
    @IsOptional()
    @IsString()
    keyword?: string;
}
