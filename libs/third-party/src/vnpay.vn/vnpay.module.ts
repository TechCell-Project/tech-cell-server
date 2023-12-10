import { DynamicModule, Module } from '@nestjs/common';
import { ConfigVnpaySchema } from 'vnpay';
import { VnpayService } from './vnpay.service';

@Module({})
export class VnpayModule {
    static forRoot(config: ConfigVnpaySchema): DynamicModule {
        return {
            module: VnpayModule,
            providers: [
                {
                    provide: 'VNPAY_INIT_OPTIONS',
                    useValue: config,
                },
                VnpayService,
            ],
            exports: [VnpayService],
        };
    }
}
