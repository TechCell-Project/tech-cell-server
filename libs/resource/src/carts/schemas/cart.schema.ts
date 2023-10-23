import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductCartSchema } from './product-cart.schema';
import { AbstractDocument } from '@app/common';
import { CartState } from '../enums';

@Schema({
    versionKey: false,
    timestamps: true,
})
export class Cart extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Array<ProductCartSchema> })
    products: Array<ProductCartSchema>;

    @Prop({ required: true, enum: CartState, default: CartState.ACTIVE })
    cartState: string;

    @Prop({ required: true, default: 0 })
    cartCountProducts: number;
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
