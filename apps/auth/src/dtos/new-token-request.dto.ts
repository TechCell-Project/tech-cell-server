import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class NewTokenRequestDTO {
    @ApiProperty({
        type: String,
        description: 'the refresh token of user',
        example: 'the-refreshToken',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    refreshToken: string;
}
