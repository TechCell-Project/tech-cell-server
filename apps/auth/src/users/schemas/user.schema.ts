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

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({
        _id: false,
        type: {
            otpCode: {
                type: String,
            },
            otpExpires: {
                type: Number,
            },
        },
        default: {
            otpCode: '',
            otpExpires: 0,
        },
    })
    otp?: {
        otpCode?: string;
        otpExpires?: number;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);
