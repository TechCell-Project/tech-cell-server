import {
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    Min,
    IsIP,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { ProductCode } from '../enums';
import { BankCode } from '../enums/bank-code.enum';

export class CreateVnpayUrlDTO {
    @IsOptional()
    @IsString()
    vnp_Command?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1000000)
    @Max(Number.MAX_VALUE)
    vnp_Amount: number;

    @IsNotEmpty()
    @IsString()
    @IsIP()
    vnp_IpAddr: string;

    /**
     * @description Thông tin đơn hàng
     */
    @IsNotEmpty()
    @IsString()
    vnp_OrderInfo: string;

    /**
     * @description Loại hàng hóa
     */
    @IsNotEmpty()
    @IsEnum(ProductCode)
    vnp_OrderType: string;

    /**
     * @description Mã ngân hàng
     */
    @IsOptional()
    @IsString()
    @IsEnum(BankCode)
    bankCode?: string;

    /**
     * @description Mã đơn hàng
     */
    @IsNotEmpty()
    @IsString()
    vnp_TxnRef: string;
}
