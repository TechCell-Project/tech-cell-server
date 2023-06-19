import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateOtpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    // @IsString()
    // @IsNotEmpty()
    // otpCode: string;
}
