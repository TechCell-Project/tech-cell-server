import { IsEmailI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class ForgotPasswordEmailDTO {
    @IsNotEmptyI18n()
    @IsStringI18n()
    firstName: string;

    @IsNotEmptyI18n()
    @IsStringI18n()
    otpCode: string;

    @IsNotEmptyI18n()
    @IsEmailI18n()
    userEmail: string;
}
