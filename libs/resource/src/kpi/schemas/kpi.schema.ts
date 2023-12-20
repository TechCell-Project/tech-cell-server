import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '~libs/resource/abstract/abstract.schema';
import { KpiStatusEnum, KpiTypeEnum } from '../enums';

@Schema({ timestamps: true })
export class Kpi extends AbstractDocument {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, enum: KpiTypeEnum })
    kpiType: string;

    @Prop({ required: true })
    value: number;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ required: false, enum: KpiStatusEnum, default: KpiStatusEnum.active })
    kpiStatus?: string;

    @Prop({ required: false, default: new Date() })
    createdAt?: Date;

    @Prop({ required: false, default: new Date() })
    updatedAt?: Date;
}

export const KpiSchema = SchemaFactory.createForClass(Kpi);

KpiSchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

KpiSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

KpiSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
