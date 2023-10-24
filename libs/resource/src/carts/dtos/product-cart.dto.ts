import { Types } from 'mongoose';
import { ProductCartSchema } from '../schemas/product-cart.schema';
import { IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductCartDTO implements ProductCartSchema {
    constructor(data: ProductCartDTO) {
        this.productId = data.productId;
        this.sku = data.sku;
        this.quantity = data.quantity;
    }

    @ApiProperty({
        description: 'Product ID',
        example: '60f4b4d6d8b5c9f5f4f7d7e4',
    })
    @IsNotEmpty()
    @IsMongoId()
    @Type(() => Types.ObjectId)
    productId: Types.ObjectId;

    @ApiProperty({
        description: 'Product SKU',
        example: '60f4b4d6d8b5c9f5f4f7d7e4',
    })
    @IsNotEmpty()
    @IsString()
    sku: string;

    @ApiProperty({
        description: 'Product quantity',
        example: 1,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    quantity: number;
}
