import { IsNotEmpty, IsNumber, IsString, Max, Min, IsIP, IsEnum } from 'class-validator';
import { ProductCode } from '../enums';

export class CreateVnpayUrlDto {
    @IsNotEmpty()
    @IsString()
    vnp_Command: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1000000)
    @Max(Number.MAX_VALUE)
    vnp_Amount: number;

    @IsNotEmpty()
    @IsString()
    @IsIP()
    ipAddress: string;

    @IsNotEmpty()
    @IsString()
    vnp_OrderInfo: string;

    @IsNotEmpty()
    @IsEnum(ProductCode)
    vnp_OrderType: string;

    @IsNotEmpty()
    @IsString()
    bankCode?: string;
}
