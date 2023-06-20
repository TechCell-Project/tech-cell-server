import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { OtpType } from '../otp.enum';

export class VerifyOtpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @IsNotEmpty()
    @IsEnum(OtpType)
    otpType: OtpType;
}
