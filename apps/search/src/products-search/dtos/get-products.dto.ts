import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_PRODUCTS_PER_PAGE } from '~libs/common/constants/product.constant';
import { Transform, Type } from 'class-transformer';
import { SelectType } from '~apps/search/enums';
import { isTrueSet } from '~libs/common';
import {
    IsBooleanI18n,
    IsEnumI18n,
    IsNumberI18n,
    IsStringI18n,
    MaxI18n,
    MinI18n,
} from '~libs/common/i18n/class-validator-i18n';

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
    @IsNumberI18n()
    @MinI18n(1)
    @MaxI18n(MAX_PRODUCTS_PER_PAGE)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Size of page for products to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumberI18n()
    @MinI18n(1)
    @MaxI18n(MAX_PRODUCTS_PER_PAGE)
    pageSize?: number;

    @ApiProperty({
        type: Boolean,
        description: 'Get detail of products',
        required: false,
    })
    @IsBooleanI18n()
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
    @IsStringI18n()
    @IsEnumI18n(SelectType)
    select_type?: string;

    @ApiProperty({
        type: String,
        description: 'Keyword to search',
        required: false,
    })
    @IsOptional()
    @IsStringI18n()
    keyword?: string;
}
