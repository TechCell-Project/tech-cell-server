import { AbstractRepository } from '~libs/resource/abstract';
import { Otp } from './otp.schema';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { OtpType } from './otp.enum';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

export class OtpRepository extends AbstractRepository<Otp> {
    protected readonly logger = new Logger(OtpRepository.name);

    constructor(
        @InjectModel(Otp.name) otpModel: Model<Otp>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(otpModel, connection, i18n);
    }

    async createOtp({
        email,
        hashedOtp,
        otpType,
    }: {
        email: string;
        hashedOtp: string;
        otpType: OtpType;
    }) {
        return this.create({ email, otpCode: hashedOtp, otpType });
    }

    async renewOtp({
        email,
        hashedOtp,
        otpType,
    }: {
        email: string;
        hashedOtp: string;
        otpType: OtpType;
    }) {
        return await this.findOneAndUpdate(
            { email, otpType },
            {
                otpCode: hashedOtp,
                updatedAt: new Date(),
            },
        );
    }

    async removeOtp({ email, otpType }: { email: string; otpType: OtpType }) {
        return await this.model.findOneAndRemove({ email, otpType });
    }
}
