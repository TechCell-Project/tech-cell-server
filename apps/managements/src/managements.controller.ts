import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ManagementsMessagePattern } from './managements.pattern';
import { Controller } from '@nestjs/common';
import { ManagementsHealthIndicator } from './managements.health';
import { RabbitMQService } from '@app/common/RabbitMQ';

@Controller('/')
export class ManagementsController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly managementsHealth: ManagementsHealthIndicator,
    ) {}

    @MessagePattern(ManagementsMessagePattern.isHealthy)
    isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.managementsHealth.isHealthy(key);
    }
}
