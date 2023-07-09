import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { SAMPLE_SERVICE } from '~/constants';
import { AuthGuard, catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { SampleMessagePattern } from '~/apps/sample';

@ApiTags('commons')
@Controller('/')
export class AppController {
    constructor(@Inject(SAMPLE_SERVICE) private readonly sampleService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @Get('sample')
    async getSample() {
        return this.sampleService.send(SampleMessagePattern.getSample, {}).pipe(catchException());
    }

    @Get('sample-auth')
    @UseGuards(AuthGuard)
    async getSampleAuth() {
        return this.sampleService
            .send(SampleMessagePattern.getSampleAuth, {})
            .pipe(catchException());
    }
}
