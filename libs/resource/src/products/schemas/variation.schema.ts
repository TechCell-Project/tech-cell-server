import { Prop } from '@nestjs/mongoose';
import { ImageSchema } from './image.schema';

export class PriceSchema {
    @Prop({ required: true })
    base: number;

    @Prop({ required: false, default: null })
    saleOff?: number;

    @Prop({ required: false, default: null })
    special?: number;
}

export class AttributeSchema {
    @Prop({ required: true })
    k: string;

    @Prop({ required: true })
    v: string;

    @Prop({ required: false })
    u?: string;
}

export class VariationSchema {
    @Prop({ required: true, unique: true })
    sku: string;

    @Prop({ required: true })
    attributes: AttributeSchema[];

    @Prop({ required: true })
    price: PriceSchema;

    @Prop({ required: true })
    stock: number;

    @Prop({ required: true })
    images: ImageSchema[];
}
