import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/resource/abstract';
import * as mongoose from 'mongoose';
import { ProductStatus } from '../enums';
import { AttributeSchema, VariationSchema } from './variation.schema';
import { ImageSchema } from './image.schema';
import { Types } from 'mongoose';

export type ProductDocument = mongoose.HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product extends AbstractDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, ref: 'Category', autopopulate: true })
    category: Types.ObjectId;

    @Prop({ required: false, type: Number, enum: ProductStatus, default: ProductStatus.Hide })
    status?: number;

    @Prop({ required: false, default: [] })
    generalAttributes: AttributeSchema[];

    @Prop({ required: false, default: [] })
    generalImages: ImageSchema[];

    @Prop({ required: false, default: [] })
    descriptionImages: ImageSchema[];

    @Prop({ required: true })
    variations: VariationSchema[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({
    name: 'text',
    categories: 'text',
    description: 'text',
});

ProductSchema.post('save', function () {
    this.set({ createdAt: new Date(), updatedAt: new Date() });
});

ProductSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

ProductSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
