import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutMessagePattern } from './checkout.pattern';
import { TCurrentUser } from '~libs/common/types';
import { ReviewOrderRequestDTO, VnpayIpnUrlDTO } from './dtos';
import { CreateOrderRequestDTO } from './dtos/create-order-request.dto';

@Controller('checkout')
export class CheckoutController {
    constructor(
        private readonly checkoutService: CheckoutService,
        private readonly rabbitmqService: RabbitMQService,
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
            data2CreateOrder,
            ip,
        }: {
            user: TCurrentUser;
            data2CreateOrder: CreateOrderRequestDTO;
            ip: string;
        },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.createOrder({
            user,
            data2CreateOrder,
            ip,
        });
    }

    @MessagePattern(CheckoutMessagePattern.getAllUserOrders)
    async getAllUserOrders({ user }: { user: TCurrentUser }) {
        return this.checkoutService.getAllUserOrders({ user });
    }

    @MessagePattern(CheckoutMessagePattern.vnpayIpnUrl)
    async vnpayIpnUrl(@Ctx() context: RmqContext, @Payload() { ...query }: VnpayIpnUrlDTO) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.vnpayIpnUrl({ ...query });
    }

    @MessagePattern(CheckoutMessagePattern.vnpayReturnUrl)
    async vnpayReturnUrl(@Ctx() context: RmqContext, @Payload() { ...query }: VnpayIpnUrlDTO) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.vnpayReturnUrl({ ...query });
    }
}
