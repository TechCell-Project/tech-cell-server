import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Attribute } from '@app/resource/attributes';

@Schema({ timestamps: true, versionKey: false })
export class Category extends AbstractDocument {
    @Prop({ unique: true, required: true })
    label: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: false, default: '' })
    url: string;

    @Prop({ required: false, default: false })
    isDeleted?: boolean;

    @Prop({ required: false, default: [] })
    requireAttributes: Attribute[];
}
export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

CategorySchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

CategorySchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
