import { IsString, IsNotEmpty } from 'class-validator';
export class ConfirmEmailRegisterDTO {
    @IsNotEmpty()
    @IsString()
    otpCode: string;
}
