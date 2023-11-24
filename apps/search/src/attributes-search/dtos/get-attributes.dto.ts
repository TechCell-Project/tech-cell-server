import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SelectType } from '../enums';
import { Type } from 'class-transformer';
import { MAX_ATTRIBUTES_PER_PAGE } from '~libs/common/constants/attribute.constant';
import {
    IsEnumI18n,
    IsNumberI18n,
    IsStringI18n,
    MinI18n,
    MaxI18n,
} from '~libs/common/i18n/class-validator-i18n';

export class GetAttributesRequestDTO {
    @ApiProperty({
        type: String,
        enum: SelectType,
        description: 'Select deleted attributes to be returned',
        default: SelectType.onlyActive,
        required: false,
    })
    @IsOptional()
    @IsStringI18n()
    @IsEnumI18n(SelectType)
    select_type?: string;

    @ApiProperty({
        type: Number,
        description: 'Page of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumberI18n()
    @MinI18n(1)
    @MaxI18n(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'PageSize of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumberI18n()
    @MinI18n(1)
    @MaxI18n(MAX_ATTRIBUTES_PER_PAGE)
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
