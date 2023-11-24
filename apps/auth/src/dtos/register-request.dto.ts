import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    PASSWORD_MAX_LENGTH,
    USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
    FIRSTNAME_MIN_LENGTH,
    FIRSTNAME_MAX_LENGTH,
    LASTNAME_MIN_LENGTH,
    LASTNAME_MAX_LENGTH,
} from '~libs/common/constants/common.constant';
import { IsEmailI18n, IsNotEmptyI18n, IsStringI18n, LengthI18n } from '~libs/common/i18n';

export class RegisterRequestDTO {
    @ApiProperty({
        description: 'The email of user to register',
        example: 'example@techcell.com',
    })
    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;

    @ApiProperty({
        description: 'Username of user to register',
        example: 'example-username',
        required: false,
        minLength: USERNAME_MIN_LENGTH,
        maxLength: USERNAME_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsOptional()
    @LengthI18n(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH)
    userName?: string;

    @ApiProperty({
        description: 'Password of user to register',
        example: 'the-password-what-will-super-strong',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    password: string;

    @ApiProperty({
        description: 'Re-password of user to register, must to be same as password',
        example: 'the-re-password-what-must-same-as-password',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    re_password: string;

    @ApiProperty({
        description: 'First name of user',
        example: 'example-first-name',
        minLength: FIRSTNAME_MIN_LENGTH,
        maxLength: FIRSTNAME_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(FIRSTNAME_MIN_LENGTH, FIRSTNAME_MAX_LENGTH)
    firstName: string;

    @ApiProperty({
        description: 'Last name of user',
        example: 'example-last-name',
        minLength: LASTNAME_MIN_LENGTH,
        maxLength: LASTNAME_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(LASTNAME_MIN_LENGTH, LASTNAME_MAX_LENGTH)
    lastName: string;
}
