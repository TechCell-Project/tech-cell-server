import { AbstractDocument } from '@app/resource/abstract';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OrderStatusEnum } from '../enums';
import {
    CheckoutOrderSchema,
    PaymentOrder,
    ProductOrderSchema,
    ShippingOrderSchema,
} from './sub-order.schema';

@Schema({ timestamps: true })
export class Order extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Array<ProductOrderSchema> })
    products: Array<ProductOrderSchema>;

    @Prop({ required: true, type: CheckoutOrderSchema })
    checkoutOrder: CheckoutOrderSchema;

    @Prop({ required: true, type: ShippingOrderSchema })
    shippingOrder: ShippingOrderSchema;

    @Prop({ required: false, type: PaymentOrder, default: {} })
    paymentOrder?: PaymentOrder;

    @Prop({ required: true, type: String })
    trackingCode: string;

    @Prop({ required: true, type: String, enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
    orderStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.post('save', function () {
    this.set({ createdAt: new Date(), updatedAt: new Date() });
});

OrderSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

OrderSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
