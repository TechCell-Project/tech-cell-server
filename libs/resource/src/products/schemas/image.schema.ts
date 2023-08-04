import { Prop } from '@nestjs/mongoose';

export class ImageSchema {
    @Prop({ required: true, unique: true })
    publicId: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: false, default: false })
    isThumbnail?: boolean;

    @Prop({ required: false, default: false })
    isPlaceholder?: boolean;

    @Prop({ required: false, default: false })
    isDeleted?: boolean;
}
