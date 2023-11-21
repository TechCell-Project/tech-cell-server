import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '~libs/resource/abstract';
import { OtpType } from './otp.enum';

@Schema({ timestamps: true })
export class Otp extends AbstractDocument {
    @Prop({ required: true })
    email: string;

    @Prop({ type: String, enum: OtpType, required: true })
    otpType!: OtpType;

    @Prop({ required: true })
    otpCode: string;

    @Prop({ default: 0 })
    wrongCount?: number;

    @Prop({ default: Date.now })
    createdAt?: Date;

    @Prop({ default: Date.now, index: 1, expires: process.env.OTP_EXPIRE_TIME_STRING || '5m' })
    updatedAt?: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ email: 1, otpType: 1 }, { unique: true });

OtpSchema.pre('save', function () {
    this.set({ updatedAt: new Date(), createdAt: new Date() });
});

OtpSchema.pre('updateOne', function () {
    this.set({ updatedAt: new Date() });
});

OtpSchema.pre('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
});
