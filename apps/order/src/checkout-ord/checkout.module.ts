import { Module } from '@nestjs/common';
import { RabbitMQService } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { UsersModule } from '@app/resource';
import { GhnModule } from '@app/third-party/giaohangnhanh';
import { VnpayModule } from '@app/third-party/vnpay.vn';

@Module({
    imports: [HttpModule, GhnModule, UsersModule, VnpayModule],
    controllers: [CheckoutController],
    providers: [RabbitMQService, CheckoutService],
})
export class CheckoutModule {}
