import { IsString, IsNumber, IsNotEmpty, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmEmailRegisterDTO {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    verifyCode: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    expMinutes: number;
}
