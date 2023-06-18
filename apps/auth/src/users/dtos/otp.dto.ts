import { IsNumber, IsString } from 'class-validator';

export class OtpDTO {
    @IsString()
    otpCode: string;

    @IsNumber()
    otpExpires: number;
}
