import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE } from '~/constants';
import { ModGuard } from '@app/common/guards';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDTO } from '~/apps/managements/users-mnt/dtos';
import { catchException } from '@app/common';

@ApiTags('managements')
@Controller('mnt')
@UseGuards(ModGuard)
export class ManagementsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @Get('users')
    async getUser(@Request() req) {
        const reqQuery: GetUsersDTO = req.query;
        return this.managementsService
            .send({ cmd: 'mnt_get_users' }, { ...reqQuery })
            .pipe(catchException());
    }

    @Get('users/:id')
    async getUserById(@Request() req) {
        const { id } = req.params;
        return this.managementsService
            .send({ cmd: 'mnt_get_user_by_id' }, { id })
            .pipe(catchException());
    }
}
