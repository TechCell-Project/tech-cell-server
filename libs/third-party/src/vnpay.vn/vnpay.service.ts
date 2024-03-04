import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVnpayUrlDTO } from './dtos';
import { VNPay, ConfigVnpay, ReturnQueryFromVNPay, QueryDr } from 'vnpay';

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly vnpayInstance: VNPay;

    constructor(@Inject('VNPAY_INIT_OPTIONS') private readonly config: ConfigVnpay) {
        this.vnpayInstance = new VNPay(this.config);
    }

    async createPaymentUrl(data?: CreateVnpayUrlDTO) {
        try {
            const url = await this.vnpayInstance.buildPaymentUrl(data);
            return url;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async verifyReturnUrl(query: ReturnQueryFromVNPay) {
        try {
            const isValid = await this.vnpayInstance.verifyReturnUrl(query);
            return isValid;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async verifyIpnCall(query: ReturnQueryFromVNPay) {
        try {
            const isValid = await this.vnpayInstance.verifyIpnCall(query);
            return isValid;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async queryDr(data: QueryDr) {
        try {
            const result = await this.vnpayInstance.queryDr(data);
            return result;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }
}
