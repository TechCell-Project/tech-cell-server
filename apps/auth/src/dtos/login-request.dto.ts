import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '~libs/common/constants/common.constant';
import { IsNotEmptyI18n, IsStringI18n, LengthI18n } from '~libs/common/i18n';

export class LoginRequestDTO {
    @ApiProperty({
        description: 'The email or userName of user to register',
        example: 'example@techcell.com',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    emailOrUsername: string;

    @ApiProperty({
        description: 'Password of user to register',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
        example: 'the-password-what-will-super-strong',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    password: string;
}
