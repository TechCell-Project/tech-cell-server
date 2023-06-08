import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product extends AbstractDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    desc: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
