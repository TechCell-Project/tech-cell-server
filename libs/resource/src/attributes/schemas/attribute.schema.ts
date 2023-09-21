import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Attribute extends AbstractDocument {
    @Prop({ unique: true })
    label: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false, default: '' })
    description: string;

    @Prop({ required: false, default: false })
    isDeleted?: boolean;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);

AttributeSchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

AttributeSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

AttributeSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
