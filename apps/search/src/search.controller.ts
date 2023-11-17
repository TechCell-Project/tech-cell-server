import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SearchMessagePattern } from './search.pattern';
import { Controller } from '@nestjs/common';
import { SearchHealthIndicator } from './search.health';
import { RabbitMQService } from '~libs/common/RabbitMQ';

@Controller('/')
export class SearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly searchHealth: SearchHealthIndicator,
    ) {}

    @MessagePattern(SearchMessagePattern.getPing)
    getPing() {
        return {
            message: 'pong',
        };
    }

    @MessagePattern(SearchMessagePattern.isHealthy)
    isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.searchHealth.isHealthy(key);
    }
}
