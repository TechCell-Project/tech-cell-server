import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { TASK_SERVICE } from '@app/common/constants';
import { ApiExcludeController } from '@nestjs/swagger';
import { SuperAdminGuard, catchException } from '@app/common';
import { DatabaseTaskEventPattern } from '~apps/task/database-task';

@ApiExcludeController()
@UseGuards(SuperAdminGuard)
@Controller('/admin')
export class AdminController {
    constructor(@Inject(TASK_SERVICE) private readonly taskService: ClientRMQ) {}

    @Get('copy-db')
    async forceCopyPrimaryToBackup() {
        this.taskService
            .emit(DatabaseTaskEventPattern.forceCopyPrimaryToBackup, {})
            .pipe(catchException());

        return { message: 'Copy database from primary to backup is running' };
    }
}
