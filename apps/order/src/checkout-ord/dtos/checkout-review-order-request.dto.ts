import { ProductCartDTO } from '@app/resource/carts/dtos/product-cart.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

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
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @ValidateNested({ each: true })
    @Transform(({ value }) => value.map((product: ProductCartDTO) => new ProductCartDTO(product)))
    productSelected: Array<ProductCartDTO>;
}
