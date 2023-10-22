import { Controller, Get, Inject } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { UTILITY_SERVICE } from '@app/common/constants';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiExcludeController()
@ApiTags('commons')
@Controller('/')
export class AppController {
    constructor(@Inject(UTILITY_SERVICE) private readonly utilityService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }
}
