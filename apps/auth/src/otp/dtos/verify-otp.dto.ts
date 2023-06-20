import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyOtpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;
}
