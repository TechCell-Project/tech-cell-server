import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import * as mongoose from 'mongoose';
import slugify from 'slugify';
import { GeneralSchema } from './general.schema';
import { FilterableSchema } from './filterable.schema';
import { Review_StatsSchema } from './reviews-stats.schema';
import { ProductStatus } from '../enums';

export type ProductDocument = mongoose.HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product extends AbstractDocument {
    @Prop({ required: true })
    general: GeneralSchema;

    @Prop({ required: true })
    filterable: FilterableSchema;

    @Prop({ required: false })
    Review_StatsSchema?: Review_StatsSchema;

    @Prop({ required: true, type: Number, enum: ProductStatus, default: 1 })
    status: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ProductSchema.index({ 'general.attributes.k': 1, 'general.attributes.v': 1 });

ProductSchema.post('validate', function (doc: any) {
    const productName: string = doc.name;
    const slug: string = slugify(productName, { lower: true });
    doc.general.sku = slug;
});
