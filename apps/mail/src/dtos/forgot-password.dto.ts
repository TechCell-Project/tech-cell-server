import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

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
