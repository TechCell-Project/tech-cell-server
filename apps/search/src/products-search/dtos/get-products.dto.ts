import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_PRODUCTS_PER_PAGE } from '~libs/common/constants/product.constant';
import { Transform, Type } from 'class-transformer';
import { SelectType } from '~apps/search/enums';
import { isTrueSet } from '~libs/common';

export class GetProductsDTO {
    constructor(data: GetProductsDTO) {
        this.page = data?.page ?? 1;
        this.pageSize = data?.pageSize ?? 10;
        this.detail = isTrueSet(data?.detail ?? false);
        this.select_type = data?.select_type ?? SelectType.onlyActive;
        this.keyword = data?.keyword ?? undefined;
    }

    @ApiProperty({
        type: Number,
        description: 'Page of products to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(MAX_PRODUCTS_PER_PAGE)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Size of page for products to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
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
    @Transform(({ value }) => isTrueSet(value))
    detail?: boolean;

    @ApiProperty({
        type: String,
        enum: SelectType,
        description: 'Type of select',
        default: SelectType.onlyActive,
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsEnum(SelectType)
    select_type?: string;

    @ApiProperty({
        type: String,
        description: 'Keyword to search',
        required: false,
    })
    @IsOptional()
    @IsString()
    keyword?: string;
}
