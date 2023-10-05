import { RabbitMQService } from '@app/common';
import { Controller } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutMessagePattern } from './checkout.pattern';

@Controller('checkout')
export class CheckoutController {
    constructor(
        private readonly checkoutService: CheckoutService,
        private readonly rabbitmqService: RabbitMQService,
    ) {}

    @MessagePattern(CheckoutMessagePattern.calculateShippingFee)
    async calculateShippingFee(@Ctx() context: RmqContext, @Payload() payload: any) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.calculateShippingFee({ user: payload.user });
    }
}
