import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDTO {
    @ApiProperty({
        description: 'The email or userName of user to register',
        example: 'example@techcell.com',
    })
    @IsString()
    @IsNotEmpty()
    emailOrUsername: string;

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
}
