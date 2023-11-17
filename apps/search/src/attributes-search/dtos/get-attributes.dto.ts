import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SelectType } from '../enums';
import { Type } from 'class-transformer';
import { MAX_ATTRIBUTES_PER_PAGE } from '~libs/common/constants/attribute.constant';

export class GetAttributesRequestDTO {
    @ApiProperty({
        type: String,
        enum: SelectType,
        description: 'Select deleted attributes to be returned',
        default: SelectType.onlyActive,
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsEnum(SelectType)
    select_type?: string;

    @ApiProperty({
        type: Number,
        description: 'Page of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'PageSize of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(MAX_ATTRIBUTES_PER_PAGE)
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
