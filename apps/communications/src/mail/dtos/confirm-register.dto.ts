import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class ConfirmEmailRegisterDTO {
    constructor(data: ConfirmEmailRegisterDTO) {
        this.otpCode = data.otpCode;
    }

    @IsNotEmptyI18n()
    @IsStringI18n()
    otpCode: string;
}
