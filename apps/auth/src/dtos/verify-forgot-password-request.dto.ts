import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyForgotPasswordDTO {
    @ApiProperty({ description: 'Email of the user', example: 'example@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'OTP code sent to the user', example: '123456' })
    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @ApiProperty({ description: 'Password of the user', example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    password: string;

    @ApiProperty({ description: 'Re-enter password of the user', example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    re_password: string;
}
