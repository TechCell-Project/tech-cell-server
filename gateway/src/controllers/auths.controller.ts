import {
    Controller,
    Post,
    Put,
    Get,
    Body,
    Req,
    Inject,
    HttpStatus,
    HttpException,
    Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthsController {
    // constructor() {}
    // @Inject('TOKEN_SERVICE')

    @Get()
    public getAuth() {
        return { data: 'hello' };
    }
}
