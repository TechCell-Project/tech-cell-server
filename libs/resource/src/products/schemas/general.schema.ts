import { Prop } from '@nestjs/mongoose';
import { Category, Manufacturer } from '../enums';

interface IAttributes {
    k: string;
    v: number | string;
    u?: string;
}

export class GeneralSchema {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, type: Array<IAttributes> })
    attributes: IAttributes[];

    @Prop({ required: false })
    sku?: string;

    @Prop({ required: true, type: String, enum: Manufacturer })
    manufacturer: string;

    @Prop({ required: true, type: Array<string> })
    images: string[];

    @Prop({ required: true, type: String, enum: Category })
    categories: string;
}
