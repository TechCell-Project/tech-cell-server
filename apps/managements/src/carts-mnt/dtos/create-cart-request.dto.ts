import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddCartRequestDTO {
    @ApiProperty({ type: String, description: 'Product ID' })
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    productId: Types.ObjectId;

    @ApiProperty({ type: String, description: "sku of product's variation" })
    @IsNotEmpty()
    @IsString()
    sku: string;

    @ApiProperty({
        type: Number,
        description:
            'Quantity of product, can be a negative to reduce quantity or remove product from cart',
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    quantity: number;
}
