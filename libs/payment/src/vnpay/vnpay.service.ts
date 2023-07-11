import { dateFormat, generateRandomString } from '@app/common';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as timezone from 'moment-timezone';
import { CreateVnpayUrlDto } from './dtos';
import { IVnpayUrlParams } from './interfaces';

export class VnpayService {
    createPaymentUrl({
        vnp_Command,
        vnp_Amount,
        ipAddress,
        vnp_OrderInfo,
        vnp_OrderType,
        bankCode = undefined,
    }: CreateVnpayUrlDto) {
        try {
            const timeGMT7 = timezone(new Date()).tz('Asia/Ho_Chi_Minh').format();
            const createDate = dateFormat(new Date(timeGMT7), 'yyyyMMddHHmmss');

            const params: IVnpayUrlParams = {
                vnp_Amount,
                vnp_Command,
                vnp_CreateDate: createDate,
                vnp_CurrCode: process.env.VNPAY_CURR_CODE,
                vnp_IpAddr: ipAddress,
                vnp_Locale: process.env.VNPAY_LOCALE,
                vnp_OrderInfo,
                vnp_OrderType,
                vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
                vnp_TmnCode: process.env.VNPAY_TMN_CODE,
                vnp_TxnRef: generateRandomString(20).toUpperCase(),
                vnp_Version: process.env.VNPAY_VERSION,
            };

            const urlParams = new URLSearchParams(Object.entries(params));
            if (bankCode) {
                urlParams.append('vnp_BankCode', bankCode);
            }

            const hmac = crypto.createHmac('sha512', process.env.VNPAY_SECRET_KEY);
            const signed = hmac.update(Buffer.from(urlParams.toString(), 'utf-8')).digest('hex');
            urlParams.append('vnp_SecureHash', signed);

            return `${process.env.VNPAY_PAYMENT_URL}?${urlParams.toString()}`;
        } catch (error) {
            Logger.error(error);
            return null;
        }
    }
}
