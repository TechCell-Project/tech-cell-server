import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

class ProductCartDTO {
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

    @IsOptional()
    @IsDate()
    createdAt?: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;
}

export class CreateCartDTO {
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    userId: Types.ObjectId;

    @IsNotEmpty()
    @Type(() => Array<ProductCartDTO>)
    products: Array<ProductCartDTO>;
}
