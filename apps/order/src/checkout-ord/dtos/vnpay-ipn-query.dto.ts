import { Type } from 'class-transformer';

export class VnpayIpnUrlDTO {
    @Type(() => Number)
    vnp_Amount: number;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;

    @Type(() => Number)
    vnp_PayDate: number;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;

    @Type(() => Number)
    vnp_TransactionNo: number;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
}
