import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { MAX_CATEGORY_PER_PAGE } from '~libs/common/constants/category.constant';
import {
    IsNumberI18n,
    IsStringI18n,
    MaxI18n,
    MinI18n,
} from '~libs/common/i18n/class-validator-i18n';

export class GetCategoriesRequestDTO {
    @ApiProperty({
        required: false,
        type: Number,
        default: 1,
    })
    @Type(() => Number)
    @IsNumberI18n()
    @IsOptional()
    @MinI18n(1)
    @MaxI18n(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        required: false,
        type: Number,
        default: 10,
    })
    @Type(() => Number)
    @IsNumberI18n()
    @IsOptional()
    @MinI18n(1)
    @MaxI18n(MAX_CATEGORY_PER_PAGE)
    pageSize?: number;

    @ApiProperty({
        type: String,
        description: 'Keyword to search',
        required: false,
    })
    @IsOptional()
    @IsStringI18n()
    keyword?: string;
}
