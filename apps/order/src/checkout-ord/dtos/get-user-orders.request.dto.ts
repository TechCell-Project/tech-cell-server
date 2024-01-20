import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationQuery } from '~libs/common/dtos';
import { IsEnumI18n } from '~libs/common/i18n';
import { PaymentMethodEnum, PaymentStatusEnum, OrderStatusEnum } from '~libs/resource/orders';

export class GetUserOrdersRequestDTO extends IntersectionType(PaginationQuery) {
    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethodEnum,
        example: PaymentMethodEnum.COD,
        required: false,
    })
    @IsOptional()
    @IsEnumI18n({ enum: PaymentMethodEnum })
    paymentMethod?: PaymentMethodEnum;

    @ApiProperty({
        description: 'Payment status',
        enum: PaymentStatusEnum,
        example: PaymentStatusEnum.PENDING,
        required: false,
    })
    @IsOptional()
    @IsEnumI18n({ enum: PaymentStatusEnum })
    paymentStatus?: PaymentStatusEnum;

    @ApiProperty({
        description: 'Order status',
        enum: OrderStatusEnum,
        example: OrderStatusEnum.PENDING,
        required: false,
    })
    @IsOptional()
    @IsEnumI18n({ enum: OrderStatusEnum })
    orderStatus?: OrderStatusEnum;
}
