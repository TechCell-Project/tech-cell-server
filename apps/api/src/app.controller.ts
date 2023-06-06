import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
    constructor(@Inject('SAMPLE_SERVICE') private readonly sampleService: ClientProxy) {}

    @Get()
    getHello(): string {
        return 'hello';
    }

    @Get('sample')
    async getSample() {
        return this.sampleService.send('get_sample', {});
    }
}
