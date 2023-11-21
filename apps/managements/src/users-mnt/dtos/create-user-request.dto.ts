import { UserRole } from '~libs/resource/users/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserRequestDto {
    @ApiProperty({
        description: 'Username of user',
        example: 'example',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    userName: string;

    @ApiProperty({
        description: 'Password of user',
        example: '123456',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'Role of user',
        example: 'admin',
        required: false,
    })
    @IsString()
    @IsOptional()
    @IsEnum(UserRole)
    role: string;

    @ApiProperty({
        description: 'Email of user',
        example: 'example@techcell.cloud',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'First name of user',
        example: 'John',
        required: false,
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        description: 'Last name of user',
        example: 'Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    lastName?: string;
}