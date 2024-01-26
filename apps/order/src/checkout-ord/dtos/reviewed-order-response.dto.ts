import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCartDTO } from '~libs/resource/carts/dtos/product-cart.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArrayI18n,
    IsEnumI18n,
    IsIntI18n,
    IsNotEmptyI18n,
    IsNumberI18n,
    IsObjectI18n,
    IsPositiveI18n,
} from '~libs/common/i18n';
import { PaymentMethodEnum } from '~libs/resource';

class Shipping {
    @IsNumberI18n()
    @IsPositiveI18n()
    total: number;

    @IsNumberI18n()
    service_fee: number;
}

export class ReviewedOrderResponseDTO {
    constructor(data: ReviewedOrderResponseDTO) {
        Object.assign(this, data);
    }

    @ApiProperty({
        example: PaymentMethodEnum.COD,
        description: 'Payment method',
        type: String,
        enum: PaymentMethodEnum,
    })
    @IsNotEmptyI18n()
    @IsEnumI18n(PaymentMethodEnum)
    paymentMethod: string;

    @ApiProperty({
        example: 1,
        description: 'Index of address selected',
        type: Number,
    })
    @IsIntI18n()
    @IsPositiveI18n()
    addressSelected: number;

    @ApiProperty({
        type: [ProductCartDTO],
        description: 'List of product selected',
    })
    @IsNotEmptyI18n({ each: true })
    @IsArrayI18n()
    @ValidateNested({ each: true })
    @Type(() => ProductCartDTO)
    productSelected: ProductCartDTO[];

    @ApiProperty({
        example: 100000,
        description: 'Total product price',
        type: Number,
    })
    @IsNumberI18n()
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
    @IsObjectI18n()
    @IsNotEmptyI18n()
    @ValidateNested()
    @Type(() => Shipping)
    shipping: { [key: string]: Shipping };
}
