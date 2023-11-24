import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class GoogleLoginRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Google id token',
        example: '1234567890abcdefg',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    idToken: string;
}
