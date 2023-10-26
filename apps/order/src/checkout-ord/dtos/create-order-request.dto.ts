import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ReviewOrderRequestDTO } from './checkout-review-order-request.dto';
import { ProductCartDTO } from '@app/resource/carts/dtos/product-cart.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethodEnum } from '../enums';

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
    @IsNotEmpty()
    @IsString()
    @IsEnum(PaymentMethodEnum)
    paymentMethod: string;
}
