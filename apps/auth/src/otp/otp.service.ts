import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { CreateOtpDTO, VerifyOtpDTO } from './dtos';
import * as otpGenerator from 'otp-generator';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { Otp } from './otp.schema';

const OTP_LENGTH = 6;
const SALT_ROUNDS = 10;

@Injectable()
export class OtpService {
    constructor(private readonly otpRepository: OtpRepository) {}

    async generateOtp() {
        const bcryptSalt = await bcrypt.genSalt(SALT_ROUNDS);
        const otpCode = otpGenerator.generate(OTP_LENGTH, {
            digits: true,
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
        });
        let hashedOtp: string;
        try {
            hashedOtp = await bcrypt.hash(otpCode, bcryptSalt);
        } catch (err) {
            Logger.error(err.message);
            throw new RpcException(new InternalServerErrorException('Failed to hash OTP code'));
        }

        return { otpCode, hashedOtp };
    }

    async createOrRenewOtp({ email }: CreateOtpDTO): Promise<Otp> {
        const { otpCode, hashedOtp } = await this.generateOtp();
        const emailOtpFound = await this.otpRepository.count({ email });
        let otp: Otp;

        if (emailOtpFound > 0) {
            otp = await this.otpRepository.renewOtp({ email, hashedOtp });
        } else {
            otp = await this.otpRepository.createOtp({ email, hashedOtp });
        }
        return { ...otp, otpCode };
    }

    async verifyOtp({ email, otpCode }: VerifyOtpDTO) {
        const otp = await this.otpRepository.findOne({ email });
        const isValid = await bcrypt.compare(otpCode, otp.otpCode);
        if (isValid) {
            return true;
        }
        return false;
    }
}
