import { ApiProperty } from '@nestjs/swagger';
import { SelectType } from '../enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SelectTypeDTO {
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
    selectType?: string;
}
