import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Attribute } from '@app/resource/attributes';

export class Category extends AbstractDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    label: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: false, default: '' })
    url: string;

    @Prop({ required: true, default: [] })
    requireAttributes: Attribute[];
}
export const CategorySchema = SchemaFactory.createForClass(Category);
