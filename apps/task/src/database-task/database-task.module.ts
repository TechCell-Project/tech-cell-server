import { MongodbModule, RabbitMQService } from '@app/common';
import { Module } from '@nestjs/common';
import { DB_TASK_CONSTANT } from './database-task.constant';
import { DatabaseTaskService } from './database-task.service';
import { DatabaseTaskController } from './database-task.controller';

@Module({
    imports: [
        MongodbModule.setup(DB_TASK_CONSTANT.primary.uri, DB_TASK_CONSTANT.primary.name, true),
        MongodbModule.setup(DB_TASK_CONSTANT.backup.uri, DB_TASK_CONSTANT.backup.name, true),
        MongodbModule.setup(DB_TASK_CONSTANT.backup2.uri, DB_TASK_CONSTANT.backup2.name, true),
    ],
    controllers: [DatabaseTaskController],
    providers: [DatabaseTaskService, RabbitMQService],
    exports: [DatabaseTaskService],
})
export class DatabaseTaskModule {}
