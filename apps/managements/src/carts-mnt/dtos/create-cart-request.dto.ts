import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddCartRequestDTO {
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    productId: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    sku: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    quantity: number;
}
