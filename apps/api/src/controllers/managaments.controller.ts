import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { MANAGAMENTS_SERVICE } from '~/constants';
import { catchError, throwError } from 'rxjs';
import { AdminGuard, ModGuard } from '@app/common/guards';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('managaments')
@Controller('managaments')
@UseGuards(ModGuard)
export class ManagamentsController {
    constructor(@Inject(MANAGAMENTS_SERVICE) private readonly managamentsService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }
}
