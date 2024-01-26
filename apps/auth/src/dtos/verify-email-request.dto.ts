import { ApiProperty } from '@nestjs/swagger';
import { IsEmailI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class VerifyEmailRequestDTO {
    @ApiProperty({
        description: 'The email of user to register',
        example: 'example@techcell.com',
    })
    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;

    @ApiProperty({
        description: 'OTP code',
        example: 'example',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    otpCode: string;
}
