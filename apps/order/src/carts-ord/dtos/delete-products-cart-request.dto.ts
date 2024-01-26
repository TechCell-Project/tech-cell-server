import { isTrueSet } from '~libs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { IsBooleanI18n, IsMongoIdI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

class SelectProduct {
    constructor(cartData: SelectProduct) {
        Object.assign(this, cartData);
    }

    @ApiProperty({
        type: String,
        description: 'Product ID',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
    })
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
    @IsBooleanI18n()
    isAll: boolean;
}
