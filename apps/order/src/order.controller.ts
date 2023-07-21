import { Controller, Get, Response, InternalServerErrorException } from '@nestjs/common';
import { OrderService } from './order.service';
import { VnpayService } from '@app/payment/vnpay/vnpay.service';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly vnpayService: VnpayService,
    ) {}

    @Get()
    getHello(): string {
        return this.orderService.getHello();
    }

    @Get('pay/vnpay')
    payVnpay(@Response() res) {
        const vnpayUrl = this.vnpayService.createPaymentUrl({
            vnp_Command: 'pay',
            vnp_Amount: 10000000,
            ipAddress: '127.0.0.1',
            vnp_OrderInfo: 'Thanh toan don hang 100',
            vnp_OrderType: '110000',
        });

        if (!vnpayUrl) {
            throw new RpcException(
                new InternalServerErrorException('Something went wrong, please try again later'),
            );
        }

        return res.redirect(vnpayUrl);
    }
}
