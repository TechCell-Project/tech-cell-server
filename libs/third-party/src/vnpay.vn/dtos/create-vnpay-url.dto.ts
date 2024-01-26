import { IsOptional } from 'class-validator';
import { ProductCode } from '../enums';
import { BankCode } from '../enums/bank-code.enum';
import {
    IsNotEmptyI18n,
    IsStringI18n,
    IsNumberI18n,
    MinI18n,
    MaxI18n,
    IsIPI18n,
    IsEnumI18n,
} from '~libs/common/i18n';

export class CreateVnpayUrlDTO {
    @IsOptional()
    @IsStringI18n()
    vnp_Command?: string;

    @IsNotEmptyI18n()
    @IsNumberI18n()
    @MinI18n(1000000)
    @MaxI18n(Number.MAX_VALUE)
    vnp_Amount: number;

    @IsNotEmptyI18n()
    @IsStringI18n()
    @IsIPI18n()
    vnp_IpAddr: string;

    /**
     * @description Thông tin đơn hàng
     */
    @IsNotEmptyI18n()
    @IsStringI18n()
    vnp_OrderInfo: string;

    /**
     * @description Loại hàng hóa
     */
    @IsNotEmptyI18n()
    @IsEnumI18n(ProductCode)
    vnp_OrderType: string;

    /**
     * @description Mã ngân hàng
     */
    @IsOptional()
    @IsStringI18n()
    @IsEnumI18n(BankCode)
    bankCode?: string;

    /**
     * @description Mã đơn hàng
     */
    @IsNotEmptyI18n()
    @IsStringI18n()
    vnp_TxnRef: string;

    @IsStringI18n()
    @IsNotEmptyI18n()
    vnp_ReturnUrl: string;
}
