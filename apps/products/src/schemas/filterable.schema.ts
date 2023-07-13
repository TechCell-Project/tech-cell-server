import { Prop } from '@nestjs/mongoose';

interface IFilter {
    id: string;
    Label: string;
}

export class FilterableSchema {
    @Prop({ required: true, type: Number })
    stock: number;

    @Prop({ required: true, type: Array<IFilter> })
    filter: IFilter[];

    @Prop({ required: true, type: Number })
    price: number;

    @Prop({ required: true, type: Number })
    special_price: number;

    @Prop({ required: true, type: String })
    thumbnail: string;
}
