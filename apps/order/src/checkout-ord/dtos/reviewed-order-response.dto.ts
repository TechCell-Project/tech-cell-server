import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsPositive,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCartDTO } from '@app/resource/carts/dtos/product-cart.dto';

class Shipping {
    @IsNumber()
    @IsPositive()
    total: number;

    @IsNumber()
    service_fee: number;
}

export class ReviewedOrderResponseDTO {
    constructor(data: ReviewedOrderResponseDTO) {
        Object.assign(this, data);
    }

    @IsInt()
    @IsPositive()
    addressSelected: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCartDTO)
    @IsNotEmpty({ each: true })
    productSelected: ProductCartDTO[];

    @IsNumber()
    totalProductPrice: number;

    @IsObject()
    @ValidateNested()
    @Type(() => Shipping)
    @IsNotEmpty()
    shipping: { [key: string]: Shipping };
}
