import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDTO {
    @ApiProperty({
        description: 'The email of user to register',
        example: 'example@techcell.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password of user to register',
        minimum: 8,
        maximum: 24,
        example: 'the-password-what-will-super-strong',
    })
    @IsString()
    @Length(8, 24)
    password: string;

    @ApiProperty({
        description: 'Re-password of user to register, must to be same as password',
        minimum: 8,
        maximum: 24,
        example: 'the-re-password-what-must-same-as-password',
    })
    @IsString()
    @Length(8, 24)
    re_password: string;
}
