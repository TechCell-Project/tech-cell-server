import { Prop } from '@nestjs/mongoose';

export class Review_StatsSchema {
    @Prop({ required: true, type: Number })
    average_rating: number;

    @Prop({ required: true, type: Number })
    review_count: number;
}
