import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDTO {
    @ApiProperty({
        description: 'The email of user to register',
        example: 'example@techcell.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Username of user to register',
        minimum: 8,
        maximum: 50,
        example: 'example-username',
    })
    @IsString()
    @IsOptional()
    @Length(8, 50)
    userName?: string;

    @ApiProperty({
        description: 'Password of user to register',
        minimum: 8,
        maximum: 24,
        example: 'the-password-what-will-super-strong',
    })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    password: string;

    @ApiProperty({
        description: 'Re-password of user to register, must to be same as password',
        minimum: 8,
        maximum: 24,
        example: 'the-re-password-what-must-same-as-password',
    })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    re_password: string;

    @ApiProperty({
        description: 'First name of user',
        minimum: 8,
        maximum: 24,
        example: 'example-first-name',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Last name of user',
        minimum: 8,
        maximum: 24,
        example: 'example-last-name',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;
}
