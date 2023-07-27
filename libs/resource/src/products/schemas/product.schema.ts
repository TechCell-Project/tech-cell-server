import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import * as mongoose from 'mongoose';
// import slugify from 'slugify';
// import { GeneralSchema } from './general.schema';
// import { FilterableSchema } from './filterable.schema';
// import { Review_StatsSchema } from './reviews-stats.schema';
import { ProductStatus } from '../enums';
import { VariationSchema } from './variation.schema';

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

    @Prop({ required: true })
    variations: VariationSchema[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ProductSchema.index({ 'general.attributes.k': 1, 'general.attributes.v': 1 });

// ProductSchema.pre('validate', function (next) {
//     if (this.isModified('general.name') || this.isNew) {
//         this.general.sku = slugify(this.general.name, { lower: true });
//     }
//     next();
// });
