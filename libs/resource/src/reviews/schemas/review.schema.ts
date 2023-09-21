import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true, versionKey: false })
export class ProductReview extends AbstractDocument {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    productId: string;

    @Prop({ required: true })
    rating: number;

    @Prop({ required: true })
    comment: string;

    @Prop({ required: true, default: Date.now })
    createdAt?: Date;

    // @Prop()
    // adminReply: string;
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);
