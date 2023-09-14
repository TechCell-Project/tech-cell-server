import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class ProductIdParamsDTO {
    @ApiProperty({
        type: Types.ObjectId,
        required: true,
        description: 'A valid product id',
        example: '64eb328d9f1cee1867c00a8c',
    })
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    @IsMongoId({ message: 'Invalid product id' })
    productId: Types.ObjectId;
}
