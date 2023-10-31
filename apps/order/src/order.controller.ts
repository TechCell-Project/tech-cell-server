import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { OrderMessagePattern } from './order.pattern';
import { Controller } from '@nestjs/common';
import { OrderHealthIndicator } from './order.health';
import { RabbitMQService } from '@app/common/RabbitMQ';

@Controller('/')
export class OrderController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly orderHealthIndicator: OrderHealthIndicator,
    ) {}

    @MessagePattern(OrderMessagePattern.isHealthy)
    isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.orderHealthIndicator.isHealthy(key);
    }
}
