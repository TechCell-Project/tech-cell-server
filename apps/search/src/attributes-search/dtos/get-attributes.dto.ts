import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SelectDelete } from '../enums';

export class GetAttributesRequestDTO {
    @ApiProperty({
        type: Boolean,
        description: 'All of attributes to be returned',
        required: false,
    })
    @IsOptional()
    all?: boolean;

    @ApiProperty({
        type: String,
        enum: SelectDelete,
        description: 'Select deleted attributes to be returned',
        default: SelectDelete.onlyActive,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    selectDelete?: string;

    @ApiProperty({
        type: Number,
        description: 'Limit of attributes to be returned',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiProperty({
        type: Number,
        description: 'Offset of attributes to be returned',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    offset?: number;
}
