import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { Controller } from '@nestjs/common';
import { GetOrdersRequestDTO } from './dtos/get-orders-request.dto';
import { OrdersMntService } from './orders-mnt.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { OrdersMntMessagePattern } from './orders-mnt.pattern';

@Controller()
export class OrdersMntController {
    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly ordersMntService: OrdersMntService,
    ) {}

    @MessagePattern(OrdersMntMessagePattern.getOrders)
    async getOrders(@Ctx() context: RmqContext, @Payload() { ...data }: GetOrdersRequestDTO) {
        this.rabbitMQService.acknowledgeMessage(context);
        return this.ordersMntService.getOrders(data);
    }

    @MessagePattern(OrdersMntMessagePattern.getOrder)
    async getOrder(@Ctx() context: RmqContext, @Payload() { orderId }) {
        this.rabbitMQService.acknowledgeMessage(context);
        return this.ordersMntService.getOrder(orderId);
    }

    @MessagePattern(OrdersMntMessagePattern.updateOrderStatus)
    async updateOrderStatus(@Ctx() context: RmqContext, @Payload() { orderId, orderStatus }) {
        this.rabbitMQService.acknowledgeMessage(context);
        return this.ordersMntService.updateOrderStatus(orderId, orderStatus);
    }
}
