import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class ForgotPasswordEmailDTO {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    verifyCode: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    expMinutes: number;

    @IsNotEmpty()
    @IsEmail()
    userEmail: string;
}
