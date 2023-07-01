import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { UserRole } from '@app/resource/users/enums';
import { Types } from 'mongoose';
import { Block } from './block.schema';

@Schema({ versionKey: false })
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
    address?: string[];

    @Prop({ default: '' })
    firstName?: string;

    @Prop({ default: '' })
    lastName?: string;

    @Prop({ type: Block })
    block?: Block;
}

export const UserSchema = SchemaFactory.createForClass(User);
