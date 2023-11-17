import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '~libs/common/constants/common.constant';

export class VerifyForgotPasswordDTO {
    @ApiProperty({ description: 'Email of the user', example: 'example@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'OTP code sent to the user', example: '123456' })
    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'password123',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsString()
    @IsNotEmpty()
    @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    password: string;

    @ApiProperty({
        description: 'Re-enter password of the user',
        example: 'password123',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsString()
    @IsNotEmpty()
    @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    re_password: string;
}
