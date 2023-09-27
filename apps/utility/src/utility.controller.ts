import { Controller } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityEventPattern } from './utility.pattern';
import { RabbitMQService } from '@app/common';
import { Ctx, RmqContext, Payload, EventPattern } from '@nestjs/microservices';
import { BotGateway } from '@app/common/Discordjs/bot/bot.gateway';
import { LogType } from './enums';

@Controller()
export class UtilityController {
    constructor(
        private readonly utilityService: UtilityService,
        private readonly rabbitMqService: RabbitMQService,
        private readonly botGateway: BotGateway,
    ) {}

    @EventPattern(UtilityEventPattern.writeLogsToDiscord)
    async writeLogsToDiscord(@Ctx() context: RmqContext, @Payload() { message }: { message: any }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.botGateway.writeLogs(message);
    }

    @EventPattern(UtilityEventPattern.writeLogsToFile)
    async writeLogsToFile(
        @Ctx() context: RmqContext,
        @Payload() { message, type }: { message: string; type: LogType },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.utilityService.writeLogsToFile(message, type);
    }
}
