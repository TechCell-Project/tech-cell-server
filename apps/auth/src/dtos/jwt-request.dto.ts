import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class JwtRequestDto {
    @IsStringI18n()
    @IsNotEmptyI18n()
    jwt?: string;
}
