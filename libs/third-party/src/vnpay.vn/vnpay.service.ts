import { Injectable, Logger } from '@nestjs/common';
import { CreateVnpayUrlDto } from './dtos';
import { VNPay } from 'vnpay';

@Injectable()
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
    private readonly vnpayInstance: VNPay;

    constructor() {
        this.vnpayInstance = new VNPay({
            tmnCode: process.env.VNPAY_TMN_CODE,
            paymentGateway: process.env.VNPAY_PAYMENT_URL,
            secureSecret: process.env.VNPAY_SECRET_KEY,
        });

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

    async createPaymentUrl(data: CreateVnpayUrlDto) {
        try {
            const url = await this.vnpayInstance.buildPaymentUrl({
                vnp_Amount: 100000,
                vnp_IpAddr: '10.10.1.1',
                vnp_OrderInfo: 'Thanh toan don hang',
                vnp_ReturnUrl: 'http://localhost:3000/vnpay-return',
                vnp_TxnRef: '123456789',
            });
            return url;
        } catch (error) {
            Logger.error(error);
            return null;
        }
    }
}
