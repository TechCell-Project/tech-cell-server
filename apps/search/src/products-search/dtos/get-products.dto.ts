import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProductsDTO {
    @ApiProperty({ type: Boolean, description: 'All of products to be returned', required: false })
    @IsOptional()
    all?: boolean;

    @ApiProperty({
        type: Number,
        description: 'Page of products to be returned',
        required: false,
    })
    @IsOptional()
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Size of page for products to be returned',
        required: false,
    })
    @IsOptional()
    pageSize?: number;
}
