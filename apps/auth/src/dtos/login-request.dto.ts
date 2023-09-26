import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '~/constants/common.constant';

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
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
        example: 'the-password-what-will-super-strong',
    })
    @IsString()
    @IsNotEmpty()
    @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    password: string;
}
