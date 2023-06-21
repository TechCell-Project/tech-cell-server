import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { UserRole } from '~/apps/auth/users/enums';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
    @Prop({ required: true })
    email: string;

    @Prop({ default: false })
    emailVerified?: boolean;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.User })
    role?: UserRole;

    @Prop({ default: [] })
    address?: string[];

    @Prop({ default: '' })
    firstName?: string;

    @Prop({ default: '' })
    lastName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
