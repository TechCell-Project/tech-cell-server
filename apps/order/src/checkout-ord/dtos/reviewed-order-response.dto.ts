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
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({
        example: 1,
        description: 'Index of address selected',
    })
    @IsInt()
    @IsPositive()
    addressSelected: number;

    @ApiProperty({
        type: [ProductCartDTO],
        description: 'List of product selected',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCartDTO)
    @IsNotEmpty({ each: true })
    productSelected: ProductCartDTO[];

    @ApiProperty({
        example: 100000,
        description: 'Total product price',
    })
    @IsNumber()
    totalProductPrice: number;

    @ApiProperty({
        example: {
            giaohangnhanh: {
                total: 22000,
                service_fee: 22000,
            },
        },
        description: 'Total shipping price',
    })
    @IsObject()
    @ValidateNested()
    @Type(() => Shipping)
    @IsNotEmpty()
    shipping: { [key: string]: Shipping };
}
