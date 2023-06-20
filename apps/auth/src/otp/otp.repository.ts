import { AbstractRepository } from '@app/common';
import { Otp } from './otp.schema';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

export class OtpRepository extends AbstractRepository<Otp> {
    protected readonly logger = new Logger(OtpRepository.name);

    constructor(
        @InjectModel(Otp.name) otpModel: Model<Otp>,
        @InjectConnection() connection: Connection,
    ) {
        super(otpModel, connection);
    }

    async createOtp({ email, hashedOtp }: { email: string; hashedOtp: string }) {
        return this.create({ email, otpCode: hashedOtp });
    }

    async renewOtp({ email, hashedOtp }: { email: string; hashedOtp: string }) {
        return await this.findOneAndUpdate(
            { email },
            {
                otpCode: hashedOtp,
                updatedAt: new Date(),
            },
        );
    }
}
