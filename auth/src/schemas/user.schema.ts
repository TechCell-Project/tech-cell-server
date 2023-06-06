import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Song {
    @Prop({ required: true, default: Types.ObjectId })
    _id: Types.ObjectId;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ default: Date.now })
    lastLogin: Date;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export type SongDocument = HydratedDocument<Song>;
export const SongSchema = SchemaFactory.createForClass(Song);
