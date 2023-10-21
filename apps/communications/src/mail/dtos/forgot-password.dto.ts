import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordEmailDTO {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    otpCode: string;

    @IsNotEmpty()
    @IsEmail()
    userEmail: string;
}
