import { Controller } from '@nestjs/common';
import { DatabaseTaskService } from './database-task.service';
import { Ctx, RmqContext, EventPattern, Payload } from '@nestjs/microservices';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { DatabaseTaskEventPattern } from './database-task.pattern';

@Controller()
export class DatabaseTaskController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly databaseTaskService: DatabaseTaskService,
    ) {}

    @EventPattern(DatabaseTaskEventPattern.forceCopyPrimaryToBackup)
    async forceCopyPrimaryToBackup(
        @Ctx() context: RmqContext,
        @Payload() { force }: { force?: boolean },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.databaseTaskService.copyPrimaryToBackup(force);
    }
}
