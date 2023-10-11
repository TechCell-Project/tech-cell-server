import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVnpayUrlDto } from './dtos';
import { ConfigVnpayDTO, VNPay } from 'vnpay';

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly vnpayInstance: VNPay;

    constructor(@Inject('VNPAY_INIT_OPTIONS') private readonly config: ConfigVnpayDTO) {
        this.vnpayInstance = new VNPay(this.config);
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
            this.logger.error(error);
            return null;
        }
    }
}