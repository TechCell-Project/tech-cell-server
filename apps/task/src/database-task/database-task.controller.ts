import { Controller } from '@nestjs/common';
import { DatabaseTaskService } from './database-task.service';
import { Ctx, Payload, RmqContext, EventPattern } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { DatabaseTaskEventPattern } from './database-task.pattern';

@Controller()
export class DatabaseTaskController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly databaseTaskService: DatabaseTaskService,
    ) {}

    @EventPattern(DatabaseTaskEventPattern.forceCopyPrimaryToBackup)
    async forceCopyPrimaryToBackup(@Ctx() context: RmqContext, @Payload() data: any) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.databaseTaskService.copyPrimaryToBackup();
    }
}
