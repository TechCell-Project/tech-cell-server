import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Factory } from 'nestjs-seeder';
import { AbstractDocument } from '~libs/resource/abstract';
import { UserRole } from '~libs/resource/users/enums';
import { BlockSchema } from './block.schema';
import { AddressSchema } from './address.schema';
import { ImageSchema } from './image.schema';
import { v4 as uuid } from 'uuid';

@Schema({ timestamps: true })
export class User extends AbstractDocument {
    @Factory((faker) => faker.internet.email({ provider: 'techcell.cloud' }))
    @Prop({ required: true, unique: true })
    email: string;

    @Factory((faker) =>
        faker.internet.userName({
            firstName: faker.person.firstName(),
            lastName: uuid(),
        }),
    )
    @Prop({ required: true, unique: true })
    userName: string;

    @Factory(() => true)
    @Prop({ default: false })
    emailVerified?: boolean;

    @Factory((faker) => faker.internet.password({ length: 16 }))
    @Prop({ required: true })
    password: string;

    @Factory(() => UserRole.User)
    @Prop({ type: String, enum: UserRole, default: UserRole.User })
    role?: string;

    @Factory(() => [])
    @Prop({ default: [] })
    address?: AddressSchema[];

    @Factory((faker) => faker.person.firstName())
    @Prop({ default: '' })
    firstName: string;

    @Factory((faker) => faker.person.lastName())
    @Prop({ default: '' })
    lastName: string;

    @Prop({ type: BlockSchema })
    block?: BlockSchema;

    @Prop({ required: false, default: {} })
    avatar?: ImageSchema;

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
