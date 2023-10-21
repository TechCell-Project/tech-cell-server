import { IsString, IsNotEmpty } from 'class-validator';
export class ConfirmEmailRegisterDTO {
    constructor(data: ConfirmEmailRegisterDTO) {
        this.otpCode = data.otpCode;
    }

    @IsNotEmpty()
    @IsString()
    otpCode: string;
}
