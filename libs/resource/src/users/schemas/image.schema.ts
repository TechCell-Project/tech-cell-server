import { Prop } from '@nestjs/mongoose';

export class ImageSchema {
    @Prop({ required: true, unique: true })
    publicId: string;

    @Prop({ required: true })
    url: string;
}
