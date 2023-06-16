import { IsNumber, IsString } from 'class-validator';

export class OptDTO {
    @IsString()
    otpCode: string;

    @IsNumber()
    otpExpires: number;
}
