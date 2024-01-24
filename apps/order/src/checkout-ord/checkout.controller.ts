import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutMessagePattern } from './checkout.pattern';
import { TCurrentUser } from '~libs/common/types';
import { GetUserOrdersRequestDTO, ReviewOrderRequestDTO, VnpayIpnUrlDTO } from './dtos';
import { CreateOrderRequestDTO } from './dtos/create-order-request.dto';
import { ObjectIdParamDTO } from '~libs/common/dtos';
import { CurrentUserDTO } from '~libs/common/dtos/current-user.dto';

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

    @MessagePattern(CheckoutMessagePattern.getUserOrders)
    async getUserOrders({
        user,
        data2Get,
    }: {
        user: TCurrentUser;
        data2Get: GetUserOrdersRequestDTO;
    }) {
        return this.checkoutService.getUserOrders({ user, data2Get });
    }

    @MessagePattern(CheckoutMessagePattern.getUserOrderById)
    async getUserOrderById({ user, id }: { user: TCurrentUser } & ObjectIdParamDTO) {
        return this.checkoutService.getUserOrderById({ user, id });
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

    @MessagePattern(CheckoutMessagePattern.getPaymentUrl)
    async getPaymentUrl(
        @Ctx() context: RmqContext,
        @Payload()
        data: ObjectIdParamDTO &
            CurrentUserDTO & {
                ip: string;
            },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.checkoutService.reGeneratePaymentUrl({
            ip: data.ip,
            orderId: data.id,
            userId: data.user._id,
            paymentReturnUrl: data?.paymentReturnUrl,
        });
    }
}
