import { Types } from 'mongoose';
import { Cart } from '../schemas';
import { ProductCartSchema } from '../schemas/product-cart.schema';
import { IsMongoIdI18n } from '~libs/common/i18n';
import { ApiProperty } from '@nestjs/swagger';
import { CartState } from '../enums';

export class ProductCartSchemaDTO implements ProductCartSchema {
    @ApiProperty({
        type: String,
        description: 'Product ID',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
        format: 'ObjectId',
    })
    productId: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: 'Product SKU',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
    })
    sku: string;

    @ApiProperty({
        type: Number,
        description: 'Product quantity',
        example: 2,
    })
    quantity: number;

    @ApiProperty({
        type: Date,
        description: 'Product created at',
        example: new Date(Date.now()),
    })
    createdAt?: Date;

    @ApiProperty({
        type: Date,
        description: 'Product updated at',
        example: new Date(Date.now()),
    })
    updatedAt?: Date;
}

export class CartDTO implements Cart {
    @ApiProperty({
        type: String,
        description: 'Cart ID',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
        format: 'ObjectId',
    })
    @IsMongoIdI18n()
    _id: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: 'User ID',
        example: '5f9d5f3b9d6b2b0017b6d5a0',
        format: 'ObjectId',
    })
    userId: Types.ObjectId;

    @ApiProperty({
        type: [ProductCartSchemaDTO],
        description: 'List of products in cart',
        required: false,
    })
    products: ProductCartSchemaDTO[];

    @ApiProperty({
        type: Number,
        description: 'Number of products in cart',
        example: 2,
    })
    cartCountProducts: number;

    @ApiProperty({
        type: String,
        description: 'Cart state',
        enum: CartState,
        example: CartState.ACTIVE,
    })
    cartState: string;
}
