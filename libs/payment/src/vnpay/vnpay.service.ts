import { dateFormat, generateRandomString } from '@app/common';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as timezone from 'moment-timezone';
import { CreateVnpayUrlDto } from './dtos';
import { IVnpayUrlParams } from './interfaces';

export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly isConfigured: boolean = true;

    private readonly vnp_CurrCode: string;
    private readonly vnp_Locale: string;
    private readonly vnp_TmnCode: string;
    private readonly vnp_Version: string;
    private readonly vnp_ReturnUrl: string;
    private readonly vnp_SecretKey: string;
    private readonly vnp_PaymentUrl: string;

    constructor() {
        const requiredEnvVars = [
            'VNPAY_CURR_CODE',
            'VNPAY_LOCALE',
            'VNPAY_TMN_CODE',
            'VNPAY_VERSION',
            'VNPAY_RETURN_URL',
            'VNPAY_SECRET_KEY',
            'VNPAY_PAYMENT_URL',
        ];

        const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
        if (missingEnvVars.length > 0) {
            this.isConfigured = false;
            this.logger.warn(`Env var is missing: ${missingEnvVars.join(', ')}`);
        }

        this.vnp_CurrCode = process.env.VNPAY_CURR_CODE;
        this.vnp_Locale = process.env.VNPAY_LOCALE;
        this.vnp_TmnCode = process.env.VNPAY_TMN_CODE;
        this.vnp_Version = process.env.VNPAY_VERSION;
        this.vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;
        this.vnp_SecretKey = process.env.VNPAY_SECRET_KEY;
        this.vnp_PaymentUrl = process.env.VNPAY_PAYMENT_URL;
    }

    createPaymentUrl({
        vnp_Command,
        vnp_Amount,
        ipAddress,
        vnp_OrderInfo,
        vnp_OrderType,
        bankCode = undefined,
    }: CreateVnpayUrlDto) {
        try {
            if (!this.isConfigured) {
                throw new Error('Vnpay is not configured');
            }
            const timeGMT7 = timezone(new Date()).tz('Asia/Ho_Chi_Minh').format();
            const createDate = dateFormat(new Date(timeGMT7), 'yyyyMMddHHmmss');

            const params: IVnpayUrlParams = {
                vnp_Amount,
                vnp_Command,
                vnp_CreateDate: createDate,
                vnp_CurrCode: this.vnp_CurrCode,
                vnp_IpAddr: ipAddress,
                vnp_Locale: this.vnp_Locale,
                vnp_OrderInfo,
                vnp_OrderType,
                vnp_ReturnUrl: this.vnp_ReturnUrl,
                vnp_TmnCode: this.vnp_TmnCode,
                vnp_TxnRef: generateRandomString(20).toUpperCase(),
                vnp_Version: this.vnp_Version,
            };

            const urlParams = new URLSearchParams(Object.entries(params));
            if (bankCode) {
                urlParams.append('vnp_BankCode', bankCode);
            }

            const hmac = crypto.createHmac('sha512', this.vnp_SecretKey);
            const signed = hmac.update(Buffer.from(urlParams.toString(), 'utf-8')).digest('hex');
            urlParams.append('vnp_SecureHash', signed);

            return `${this.vnp_PaymentUrl}?${urlParams.toString()}`;
        } catch (error) {
            Logger.error(error);
            return null;
        }
    }
}
