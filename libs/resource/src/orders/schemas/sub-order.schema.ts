import { AddressSchema } from '@app/resource/users/schemas/address.schema';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentMethodEnum, PaymentStatus } from '../enums';

export class ProductOrderSchema {
    @Prop({ type: Types.ObjectId, ref: 'Product' })
    productId: Types.ObjectId;

    @Prop({ type: String, required: true })
    sku: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;
}

export class ShippingOrderSchema {
    @Prop({ required: false, type: AddressSchema, default: {} })
    fromAddress?: AddressSchema;

    @Prop({ required: true, type: AddressSchema })
    toAddress?: AddressSchema;
}

export class CheckoutOrderSchema {
    @Prop({ required: true, type: Number })
    totalPrice: number;

    @Prop({ required: true, type: Number })
    totalApplyDiscount: number;

    @Prop({ required: true, type: Number })
    shippingFee: number;
}

export class PaymentOrder {
    @Prop({ required: true, type: String, enum: PaymentMethodEnum })
    method: string;

    @Prop({ required: true, type: String, enum: PaymentStatus })
    status: string;
}
