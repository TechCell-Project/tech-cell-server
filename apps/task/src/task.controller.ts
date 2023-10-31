import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { TaskMessagePattern } from './task.pattern';
import { Controller } from '@nestjs/common';
import { TaskHealthIndicator } from './task.health';
import { RabbitMQService } from '@app/common/RabbitMQ';

@Controller('/')
export class TaskController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly taskHealthIndicator: TaskHealthIndicator,
    ) {}

    @MessagePattern(TaskMessagePattern.isHealthy)
    isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.taskHealthIndicator.isHealthy(key);
    }
}
