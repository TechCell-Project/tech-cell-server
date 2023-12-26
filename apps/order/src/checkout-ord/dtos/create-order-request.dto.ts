import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ReviewOrderRequestDTO } from './checkout-review-order-request.dto';
import { ProductCartDTO } from '~libs/resource/carts/dtos/product-cart.dto';
import { IsEnumI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';
import { PaymentMethodEnum } from '~libs/resource/orders/enums';

export class CreateOrderRequestDTO extends IntersectionType(ReviewOrderRequestDTO) {
    constructor(data: CreateOrderRequestDTO) {
        super(data, ReviewOrderRequestDTO);
        this.addressSelected = data?.addressSelected;
        this.productSelected = data?.productSelected?.map((product) => new ProductCartDTO(product));
    }

    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethodEnum,
        example: PaymentMethodEnum.COD,
        default: PaymentMethodEnum.VNPAY,
        required: true,
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    @IsEnumI18n(PaymentMethodEnum)
    paymentMethod: string;
}
