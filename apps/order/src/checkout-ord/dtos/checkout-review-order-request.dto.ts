import { ProductCartDTO } from '~libs/resource/carts/dtos/product-cart.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsNumber,
    ValidateNested,
} from 'class-validator';

export class ReviewOrderRequestDTO {
    constructor(data: ReviewOrderRequestDTO) {
        this.addressSelected = data?.addressSelected;
        this.productSelected = data?.productSelected?.map((product) => new ProductCartDTO(product));
    }

    @ApiProperty({
        description: 'Index of address selected (index begin from 0)',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    addressSelected: number;

    @ApiProperty({
        description: 'List of product selected',
        type: [ProductCartDTO],
        minItems: 1,
        maxItems: 1000,
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @ValidateNested({ each: true })
    @Transform(({ value }) => {
        if (value && Array.isArray(value)) {
            return value?.map((item) => new ProductCartDTO(item));
        }
        return [];
    })
    productSelected: Array<ProductCartDTO>;
}
