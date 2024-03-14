import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiExcludeController()
@ApiTags('commons')
@Controller('/')
export class AppController {
    constructor() {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }
}
