import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAttributesDTO {
    @ApiProperty({
        type: Boolean,
        description: 'All of attributes to be returned',
        required: false,
    })
    @IsOptional()
    all?: boolean;

    @ApiProperty({
        type: Number,
        description: 'Limit of attributes to be returned',
        required: false,
    })
    @IsOptional()
    limit?: number;

    @ApiProperty({
        type: Number,
        description: 'Offset of attributes to be returned',
        required: false,
    })
    @IsOptional()
    offset?: number;
}
