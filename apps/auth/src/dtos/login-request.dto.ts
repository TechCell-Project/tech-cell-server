import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDTO {
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
    @IsNotEmpty()
    password: string;
}
