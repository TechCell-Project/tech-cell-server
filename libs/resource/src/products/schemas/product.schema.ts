import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import * as mongoose from 'mongoose';
import { ProductStatus } from '../enums';
import { AttributeSchema, VariationSchema } from './variation.schema';
import { ImageSchema } from './image.schema';

export type ProductDocument = mongoose.HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product extends AbstractDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    brand: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    categories: string[];

    @Prop({ required: true, type: Number, enum: ProductStatus, default: 1 })
    status: number;

    @Prop({ required: false, default: [] })
    generalAttributes: AttributeSchema[];

    @Prop({ required: false, default: [] })
    generalImages: ImageSchema[];

    @Prop({ required: true })
    variations: VariationSchema[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
