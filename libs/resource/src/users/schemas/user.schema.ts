import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { UserRole } from '@app/resource/users/enums';
import { BlockSchema } from './block.schema';
import { AddressSchema } from './address.schema';

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
    @Prop({ required: true })
    email: string;

    @Prop({ default: false })
    emailVerified?: boolean;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.User })
    role?: string;

    @Prop({ default: [] })
    address?: AddressSchema[];

    @Prop({ default: '' })
    firstName?: string;

    @Prop({ default: '' })
    lastName?: string;

    @Prop({ type: BlockSchema })
    block?: BlockSchema;

    @Prop({ default: Date.now })
    createdAt?: Date;

    @Prop({ default: Date.now })
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

UserSchema.pre('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

UserSchema.pre('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
