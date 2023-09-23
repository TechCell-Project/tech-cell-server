import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ProductIdParamsDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'A valid product id',
        example: '64eb328d9f1cee1867c00a8c',
    })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid product id' })
    productId: string | Types.ObjectId;
}

export class ProductSkuParamsDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'A valid product sku',
    })
    @IsNotEmpty()
    @IsString()
    sku: string;
}
