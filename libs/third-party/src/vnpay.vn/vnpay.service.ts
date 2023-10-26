import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVnpayUrlDTO } from './dtos';
import { ConfigVnpayDTO, VNPay, ReturnQueryFromVNPayDTO } from 'vnpay';

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly vnpayInstance: VNPay;

    constructor(@Inject('VNPAY_INIT_OPTIONS') private readonly config: ConfigVnpayDTO) {
        this.vnpayInstance = new VNPay(this.config);
    }

    async createPaymentUrl(data?: CreateVnpayUrlDTO) {
        try {
            const url = await this.vnpayInstance.buildPaymentUrl({
                ...data,
            });
            return url;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async verifyReturnUrl(query: ReturnQueryFromVNPayDTO) {
        try {
            const isValid = await this.vnpayInstance.verifyReturnUrl(query);
            return isValid;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }
}
