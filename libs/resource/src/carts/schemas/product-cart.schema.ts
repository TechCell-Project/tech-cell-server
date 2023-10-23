import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class ProductCartSchema {
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
