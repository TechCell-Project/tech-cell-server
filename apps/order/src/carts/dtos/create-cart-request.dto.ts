import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddCartRequestDTO {
    constructor(cartData: AddCartRequestDTO) {
        this.productId = new Types.ObjectId(cartData?.productId);
        this.sku = cartData?.sku;
        this.quantity = cartData?.quantity ? Number(cartData?.quantity) : 0;
    }

    @ApiProperty({ type: String, description: 'Product ID' })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid product id' })
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
