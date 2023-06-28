import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { MANAGAMENTS_SERVICE } from '~/constants';
import { catchError, throwError } from 'rxjs';
import { ModGuard } from '@app/common/guards';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDTO } from '~/apps/managaments/users-mnt/dtos';

@ApiTags('managaments')
@Controller('mnt')
@UseGuards(ModGuard)
export class ManagamentsController {
    constructor(@Inject(MANAGAMENTS_SERVICE) private readonly managamentsService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @Get('users')
    async getUser(@Request() req) {
        const reqQuery: GetUsersDTO = req.query;
        return this.managamentsService
            .send({ cmd: 'mnt_get_users' }, { ...reqQuery })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @Get('users/:id')
    async getUserById(@Request() req) {
        const { id } = req.params;
        return this.managamentsService
            .send({ cmd: 'mnt_get_user_by_id' }, { id })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
