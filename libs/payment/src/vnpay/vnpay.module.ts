import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';

@Module({
    imports: [VnpayService],
    exports: [VnpayService],
})
export class VnpayModule {}
