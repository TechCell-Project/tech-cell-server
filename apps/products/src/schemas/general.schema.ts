import { Prop } from '@nestjs/mongoose';
import { Category, Manufacturer } from '~/apps/products/enums';

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

    @Prop({ required: true })
    sku: string;

    @Prop({ required: true, type: String, enum: Manufacturer })
    manufacturer: string;

    @Prop({ required: true, type: Array<string> })
    image: string[];

    @Prop({ required: true, type: String, enum: Category })
    categories: string;

    @Prop({ required: true, type: Boolean })
    status: boolean;
}
