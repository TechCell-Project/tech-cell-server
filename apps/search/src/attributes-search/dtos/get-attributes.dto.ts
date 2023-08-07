import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SelectType } from '../enums';

export class GetAttributesRequestDTO {
    @ApiProperty({
        type: Boolean,
        description: 'All of attributes to be returned',
        default: false,
        required: false,
    })
    @IsOptional()
    no_limit?: boolean;

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
    @IsNumber()
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'PageSize of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    pageSize?: number;
}
