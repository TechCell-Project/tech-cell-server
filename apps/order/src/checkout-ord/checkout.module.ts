import { Module } from '@nestjs/common';
import { RabbitMQService } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { GhnModule } from '@app/third-party/giaohangnhanh';
import { GhtkModule } from '@app/third-party/giaohangtietkiem.vn';
import { UsersModule } from '@app/resource';

@Module({
    imports: [HttpModule, GhtkModule, GhnModule, UsersModule],
    controllers: [CheckoutController],
    providers: [RabbitMQService, CheckoutService],
})
export class CheckoutModule {}
