import { RabbitMQService } from '@app/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutMessagePattern } from './checkout.pattern';
import { VnpayService } from '@app/third-party/vnpay.vn';
import { TCurrentUser } from '@app/common/types';
import { ReviewOrderRequestDTO } from './dtos';

@Controller('checkout')
export class CheckoutController {
    constructor(
        private readonly checkoutService: CheckoutService,
        private readonly rabbitmqService: RabbitMQService,
        private readonly vnpayService: VnpayService,
    ) {}

    @MessagePattern(CheckoutMessagePattern.reviewOrder)
    async reviewOrder(
        @Ctx() context: RmqContext,
        @Payload()
        {
            user,
            dataReview,
        }: {
            user: TCurrentUser;
            dataReview: ReviewOrderRequestDTO;
        },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.reviewOrder({
            user,
            dataReview,
        });
    }

    @MessagePattern(CheckoutMessagePattern.createOrder)
    async createOrder(
        @Ctx() context: RmqContext,
        @Payload()
        {
            user,
            dataReview,
        }: {
            user: TCurrentUser;
            dataReview: ReviewOrderRequestDTO;
        },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.createOrder({
            user,
            dataReview,
        });
    }
}
