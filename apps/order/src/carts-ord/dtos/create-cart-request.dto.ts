import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { IsMongoIdI18n, IsNotEmptyI18n, IsNumberI18n, IsStringI18n } from '~libs/common/i18n';

export class AddCartRequestDTO {
    constructor(cartData: AddCartRequestDTO) {
        this.productId = new Types.ObjectId(cartData?.productId);
        this.sku = cartData?.sku;
        this.quantity = cartData?.quantity ? Number(cartData?.quantity) : 0;
    }

    @ApiProperty({ type: String, description: 'Product ID', example: '5f9d5f3b9d6b2b0017b6d5a0' })
    @IsNotEmptyI18n()
    @IsMongoIdI18n()
    productId: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: "sku of product's variation",
        example: 'iphone_13-color.black-storage.128.gb',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    sku: string;

    @ApiProperty({
        type: Number,
        description:
            'Quantity of product, can be a negative to reduce quantity or remove product from cart',
        example: 1,
    })
    @IsNotEmptyI18n()
    @IsNumberI18n()
    @Type(() => Number)
    quantity: number;
}
