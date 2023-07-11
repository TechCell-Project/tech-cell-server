import { Module } from '@nestjs/common';
import { VnpayModule } from './vnpay';
import { VnpayService } from './vnpay/vnpay.service';

@Module({
    imports: [VnpayModule],
    providers: [VnpayService],
    exports: [VnpayModule, VnpayService],
})
export class PaymentModule {}
