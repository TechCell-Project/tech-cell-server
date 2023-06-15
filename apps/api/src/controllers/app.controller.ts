import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { SAMPLE_SERVICE } from '~/constants';
import { catchError, throwError } from 'rxjs';
import { AuthGuard } from '@app/common';

@Controller('/')
export class AppController {
    constructor(@Inject(SAMPLE_SERVICE) private readonly sampleService: ClientProxy) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @Get('sample')
    async getSample() {
        return this.sampleService
            .send('get_sample', {})
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @Get('sample-auth')
    @UseGuards(AuthGuard)
    async getSampleAuth() {
        return this.sampleService
            .send('get_sample_auth', {})
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
