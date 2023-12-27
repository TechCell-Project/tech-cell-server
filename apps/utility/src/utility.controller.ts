import { Controller } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityEventPattern, UtilityMessagePattern } from './utility.pattern';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Ctx, RmqContext, Payload, EventPattern, MessagePattern } from '@nestjs/microservices';
import { LogType } from './enums';
import { UtilityHealthIndicator } from './utility.health';

@Controller()
export class UtilityController {
    constructor(
        private readonly utilityService: UtilityService,
        private readonly rabbitMqService: RabbitMQService,
        private readonly utilityHealthIndicator: UtilityHealthIndicator,
    ) {}

    @MessagePattern(UtilityMessagePattern.isHealthy)
    isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.utilityHealthIndicator.isHealthy(key);
    }

    @EventPattern(UtilityEventPattern.writeLogsToDiscord)
    async writeLogsToDiscord(@Ctx() context: RmqContext, @Payload() { message }: { message: any }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.utilityService.writeLogsToDiscord(message);
    }

    @EventPattern(UtilityEventPattern.writeLogsToFile)
    async writeLogsToFile(
        @Ctx() context: RmqContext,
        @Payload() { message, type }: { message: string; type: LogType },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.utilityService.writeLogsToFile(message, type);
    }

    @EventPattern(UtilityEventPattern.writeLogsBashToDiscord)
    async writeLogsBashToDiscord(
        @Ctx() context: RmqContext,
        @Payload() { message }: { message: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.utilityService.writeLogsBashToDiscord(message);
    }
}
