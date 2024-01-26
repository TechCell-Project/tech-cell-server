import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '~libs/common/constants/common.constant';
import { IsEmailI18n, IsNotEmptyI18n, IsStringI18n, LengthI18n } from '~libs/common/i18n';

export class VerifyForgotPasswordDTO {
    @ApiProperty({ description: 'Email of the user', example: 'example@example.com' })
    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;

    @ApiProperty({ description: 'OTP code sent to the user', example: '123456' })
    @IsStringI18n()
    @IsNotEmptyI18n()
    otpCode: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'password123',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    password: string;

    @ApiProperty({
        description: 'Re-enter password of the user',
        example: 'password123',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @LengthI18n(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    re_password: string;
}
