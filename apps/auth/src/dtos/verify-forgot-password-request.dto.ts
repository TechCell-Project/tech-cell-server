import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyForgotPasswordDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    re_password: string;
}
