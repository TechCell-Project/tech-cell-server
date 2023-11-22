import { Types } from 'mongoose';
import { Order } from '../schemas';
import {
    CheckoutOrderSchema,
    PaymentOrder,
    ProductOrderSchema,
    ShippingOrderSchema,
} from '../schemas/sub-order.schema';
import { ApiProperty } from '@nestjs/swagger';
import { AddressSchemaDTO } from '~libs/resource/users/dtos/user-schema.dto';
import { PaymentMethodEnum } from '~apps/order/checkout-ord/enums';
import { OrderStatusEnum, PaymentStatusEnum } from '../enums';

export class ProductOrderSchemaDTO implements ProductOrderSchema {
    @ApiProperty({ type: String, example: '5f9d7a9b9b3f3b1b1c9f9b3f' })
    productId: Types.ObjectId;

    @ApiProperty({ type: Number, example: 10 })
    quantity: number;

    @ApiProperty({ type: String, example: 'iphone_14-color.black-storage.512.gb' })
    sku: string;

    @ApiProperty({
        type: Date,
        example: new Date(),
    })
    createdAt?: Date;

    @ApiProperty({
        type: Date,
        example: new Date(),
    })
    updatedAt?: Date;
}

export class CheckoutOrderSchemaDTO implements CheckoutOrderSchema {
    @ApiProperty({ type: Number, example: 13499000 })
    shippingFee: number;

    @ApiProperty({ type: Number, example: 15000 })
    totalApplyDiscount: number;

    @ApiProperty({ type: Number, example: 13484000 })
    totalPrice: number;
}

export class ShippingOrderSchemaDTO implements ShippingOrderSchema {
    @ApiProperty({ type: AddressSchemaDTO, required: false })
    fromAddress?: AddressSchemaDTO;

    @ApiProperty({ type: AddressSchemaDTO })
    toAddress?: AddressSchemaDTO;
}

export class PaymentOrderDTO implements PaymentOrder {
    @ApiProperty({ type: String, enum: PaymentMethodEnum, example: PaymentMethodEnum.VNPAY })
    method: string;

    @ApiProperty({
        type: String,
        enum: PaymentStatusEnum,
        example: PaymentStatusEnum.WAIT_FOR_PAYMENT,
    })
    status: string;

    @ApiProperty({ type: String, required: false, example: 'https://vnpay.vn/' })
    paymentUrl?: string;

    @ApiProperty({ type: Object, required: false, default: {} })
    orderData?: object;
}

export class OrderSchemaDTO implements Order {
    @ApiProperty({ type: String, example: '5f9d7a9b9b3f3b1b1c9f9b3f' })
    _id: Types.ObjectId;

    @ApiProperty({ type: String, example: '5f9d7a9b9b3f3b1b1c9f9b3f' })
    userId: Types.ObjectId;

    @ApiProperty({ type: [ProductOrderSchemaDTO] })
    products: Array<ProductOrderSchemaDTO>;

    @ApiProperty({ type: CheckoutOrderSchemaDTO })
    checkoutOrder: CheckoutOrderSchemaDTO;

    @ApiProperty({ type: ShippingOrderSchemaDTO })
    shippingOrder: ShippingOrderSchemaDTO;

    @ApiProperty({ type: PaymentOrderDTO, required: false })
    paymentOrder?: PaymentOrderDTO;

    @ApiProperty({ type: String, example: '1490-1A0807-1698349462504' })
    trackingCode: string;

    @ApiProperty({ type: String, enum: OrderStatusEnum, example: OrderStatusEnum.PENDING })
    orderStatus: string;
}
