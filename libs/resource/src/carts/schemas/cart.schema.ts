import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductCart } from './product-cart.schema';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class Cart extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Array<ProductCart> })
    products: Array<ProductCart>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.post('save', function () {
    this.set({ createdAt: new Date(), updatedAt: new Date() });
});

CartSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

CartSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
