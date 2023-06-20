import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailRequestDTO {
    @ApiProperty({
        description: 'The email of user to register',
        example: 'example@techcell.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'OTP code',
        example: 'example',
    })
    @IsString()
    @IsNotEmpty()
    otpCode: string;
}
