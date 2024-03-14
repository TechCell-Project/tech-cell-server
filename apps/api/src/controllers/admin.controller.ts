import { Controller, Get, Inject } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { TASK_SERVICE } from '~libs/common/constants';
import { ApiExcludeController } from '@nestjs/swagger';
import { catchException } from '~libs/common';
import { DatabaseTaskEventPattern } from '~apps/task/database-task';
import { Auth } from '~libs/common/decorators';
import { UserRole } from '~libs/resource/users/enums';

@ApiExcludeController()
@Auth(UserRole.Manager)
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
