import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class NewTokenRequestDTO {
    @ApiProperty({
        description: 'the refresh token of user',
        example: 'the-refreshToken',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    refreshToken: string;
}
