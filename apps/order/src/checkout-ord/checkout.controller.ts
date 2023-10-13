import { RabbitMQService } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutMessagePattern } from './checkout.pattern';
import { VnpayService } from '@app/third-party/vnpay.vn';

@Controller('checkout')
export class CheckoutController {
    constructor(
        private readonly checkoutService: CheckoutService,
        private readonly rabbitmqService: RabbitMQService,
        private readonly vnpayService: VnpayService,
    ) {}

    @MessagePattern(CheckoutMessagePattern.calculateShippingFee)
    async calculateShippingFee(@Ctx() context: RmqContext, @Payload() payload: any) {
        this.rabbitmqService.acknowledgeMessage(context);
        console.log(
            this.vnpayService.createPaymentUrl({
                ipAddress: '',
                vnp_Amount: 10000,
                vnp_OrderInfo: 'test',
                vnp_OrderType: '110000',
            }),
        );
        return this.checkoutService.calculateShippingFee({ user: payload.user });
    }

    @Get('/vnpay')
    async checkoutVnpay() {
        return this.vnpayService.createPaymentUrl({
            ipAddress: '',
            vnp_Amount: 10000,
            vnp_OrderInfo: 'test',
            vnp_OrderType: '110000',
        });
    }
}
