import { Module } from '@nestjs/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { HttpModule } from '@nestjs/axios';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { ProductsModule, UsersModule } from '@app/resource';
import { GhnModule } from '@app/third-party/giaohangnhanh';
import { VnpayModule } from '@app/third-party/vnpay.vn';
import { OrdersModule } from '@app/resource/orders';
import { CartsModule } from '@app/resource/carts';
import { RedisModule } from '@app/common/Redis';

@Module({
    imports: [
        HttpModule,
        GhnModule,
        UsersModule,
        VnpayModule.forRoot({
            paymentGateway: process.env.VNPAY_PAYMENT_URL,
            secureSecret: process.env.VNPAY_SECRET_KEY,
            tmnCode: process.env.VNPAY_TMN_CODE,
            returnUrl: process.env.VNPAY_RETURN_URL,
        }),
        ProductsModule,
        OrdersModule,
        CartsModule,
        RedisModule,
    ],
    controllers: [CheckoutController],
    providers: [RabbitMQService, CheckoutService],
})
export class CheckoutModule {}
