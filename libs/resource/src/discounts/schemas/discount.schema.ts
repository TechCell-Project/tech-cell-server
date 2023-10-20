import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SelectProduct } from '@app/resource/products/dtos/select-product.dto';
import { ApplyDiscountTo, DiscountType } from '../enums';
import { User } from '@app/resource/users';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Discount extends AbstractDocument {
    @Prop({
        required: true,
        type: String,
    })
    discountName: string;

    @Prop({ required: true, type: String })
    discountDescription: string;

    /**
     * @enum {DiscountType}
     */
    @Prop({ required: true, type: String, enum: DiscountType })
    discountType: string;

    @Prop({ required: true, type: Number, default: 0 })
    discountValue: string;

    @Prop({ required: true, type: String })
    discountCode: string;

    /**
     * @default new Date()
     */
    @Prop({ required: true, type: Date, default: new Date() })
    discountStartDate: Date;

    /**
     * @default new Date()
     */
    @Prop({ required: true, type: Date, default: new Date() })
    discountEndDate: Date;

    /**
     * @description Max num of use time
     * @default 0
     */
    @Prop({ required: true, default: 0 })
    discountMaxUseTimes: number;

    /**
     * @description Time of use
     * @default 0
     */
    @Prop({ required: true, default: 0 })
    discountUsesCount: number;

    /**
     * @description Who used this discount
     */
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    discountUserUsed: Array<Pick<User, '_id'>>;

    /**
     * @description Max time of use per user
     * @default 0
     */
    @Prop({ required: true, default: 0 })
    discountMaxUsesPerUser: number;

    /**
     * @description Min order value to use this discount
     * @default 0
     */
    @Prop({ required: true, default: 0 })
    discountMinOrderValue: number;

    @Prop({ required: true, default: false })
    discountIsActive: boolean;

    /**
     * @enum {ApplyDiscountTo}
     */
    @Prop({
        required: true,
        type: String,
        enum: ApplyDiscountTo,
        default: ApplyDiscountTo.AllProducts,
    })
    discountAppliesTo: string;

    @Prop({ type: Array, default: [] })
    discountProductApplies: Array<SelectProduct>;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
DiscountSchema.post('save', function () {
    this.set({ createdAt: new Date(), updatedAt: new Date() });
});

DiscountSchema.post('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

DiscountSchema.post('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
