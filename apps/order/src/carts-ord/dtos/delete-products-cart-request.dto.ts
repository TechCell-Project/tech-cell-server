import { isTrueSet } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

class SelectProduct {
    constructor(cartData: SelectProduct) {
        this.productId = new Types.ObjectId(cartData?.productId);
        this.sku = cartData?.sku;
    }

    @ApiProperty({
        type: String,
        description: 'Product ID',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
    })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid product id' })
    productId: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: "sku of product's variation",
        example: 'iphone_13-color.black-storage.128.gb',
    })
    @IsNotEmpty()
    @IsString()
    sku: string;
}

export class DeleteProductsCartRequestDTO {
    constructor(cartData: DeleteProductsCartRequestDTO) {
        if (cartData?.selectProducts?.length > 0) {
            this.selectProducts = cartData?.selectProducts?.map(
                (product) => new SelectProduct(product),
            );
        }

        this.isAll = cartData?.isAll ?? false;
    }

    @ApiProperty({
        type: [SelectProduct],
        description: 'List of products to delete',
        required: false,
    })
    @IsOptional()
    @Type(() => SelectProduct)
    @ValidateNested({ each: true })
    selectProducts?: SelectProduct[];

    @ApiProperty({
        type: Boolean,
        description: 'Delete all products in cart',
        example: false,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => isTrueSet(value))
    @IsBoolean()
    isAll: boolean;
}
