import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { OtpType } from '../otp.enum';

export class CreateOtpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsEnum(OtpType)
    otpType: OtpType;
}
