import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { TASK_SERVICE } from '~libs/common/constants';
import { ApiExcludeController } from '@nestjs/swagger';
import { ManagerGuard, catchException } from '~libs/common';
import { DatabaseTaskEventPattern } from '~apps/task/database-task';

@ApiExcludeController()
@UseGuards(ManagerGuard)
@Controller('/admin')
export class AdminController {
    constructor(@Inject(TASK_SERVICE) private readonly taskService: ClientRMQ) {}

    @Get('copy-db')
    async forceCopyPrimaryToBackup() {
        this.taskService
            .emit(DatabaseTaskEventPattern.forceCopyPrimaryToBackup, { force: true })
            .pipe(catchException());

        return { message: 'Copy database from primary to backup is running' };
    }
}
