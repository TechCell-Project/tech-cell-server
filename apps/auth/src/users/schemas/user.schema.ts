import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'user' })
    role?: 'user' | 'mod' | 'admin';

    @Prop({ default: [] })
    address?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
