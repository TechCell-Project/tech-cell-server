import { ProductCartDTO } from '~libs/resource/carts/dtos/product-cart.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import {
    ArrayMaxSizeI18n,
    ArrayMinSizeI18n,
    IsArrayI18n,
    IsEnumI18n,
    IsNotEmptyI18n,
    IsNumberI18n,
    IsStringI18n,
} from '~libs/common/i18n';
import { PaymentMethodEnum } from '~libs/resource';

export class ReviewOrderRequestDTO {
    constructor(data: ReviewOrderRequestDTO) {
        this.paymentMethod = data?.paymentMethod ?? PaymentMethodEnum.COD;
        this.addressSelected = data?.addressSelected;
        this.productSelected = data?.productSelected?.map((product) => new ProductCartDTO(product));
    }

    @ApiProperty({
        description: 'Payment method, default is COD',
        type: String,
        enum: PaymentMethodEnum,
        example: PaymentMethodEnum.COD,
        required: false,
    })
    @IsOptional()
    @IsStringI18n()
    @IsEnumI18n(PaymentMethodEnum)
    paymentMethod: string;

    @ApiProperty({
        description: 'Index of address selected (index begin from 0)',
        example: 1,
        type: Number,
    })
    @IsNotEmptyI18n()
    @IsNumberI18n()
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
