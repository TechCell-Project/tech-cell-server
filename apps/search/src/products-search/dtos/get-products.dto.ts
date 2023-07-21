import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProductsDTO {
    @ApiProperty({ type: Boolean, description: 'All of products to be returned', required: false })
    @IsOptional()
    all?: boolean;

    @ApiProperty({ type: Number, description: 'Limit of products to be returned', required: false })
    @IsOptional()
    limit?: number;

    @ApiProperty({
        type: Number,
        description: 'Offset of products to be returned',
        required: false,
    })
    @IsOptional()
    offset?: number;
}
