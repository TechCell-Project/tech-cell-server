import { AbstractDocument } from '@app/common/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Order extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
    productId: Types.ObjectId;

    @Prop({ type: String, required: true })
    sku: string;

    @Prop({ type: Number, required: true })
    quantity: number;
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
