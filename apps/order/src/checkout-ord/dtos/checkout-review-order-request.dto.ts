import { ProductCartDTO } from '~libs/resource/carts/dtos/product-cart.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
    ArrayMaxSizeI18n,
    ArrayMinSizeI18n,
    IsArrayI18n,
    IsNotEmptyI18n,
    IsNumberI18n,
} from '~libs/common/i18n';

export class ReviewOrderRequestDTO {
    constructor(data: ReviewOrderRequestDTO) {
        this.addressSelected = data?.addressSelected;
        this.productSelected = data?.productSelected?.map((product) => new ProductCartDTO(product));
    }

    @ApiProperty({
        description: 'Index of address selected (index begin from 0)',
        example: 1,
    })
    @IsNumberI18n()
    @IsNotEmptyI18n()
    @Type(() => Number)
    addressSelected: number;

    @ApiProperty({
        description: 'List of product selected',
        type: [ProductCartDTO],
        minItems: 1,
        maxItems: 1000,
    })
    @IsNotEmptyI18n()
    @IsArrayI18n()
    @ArrayMinSizeI18n(1)
    @ArrayMaxSizeI18n(1000)
    @Type(() => ProductCartDTO)
    @ValidateNested({ each: true })
    productSelected: Array<ProductCartDTO>;
}
