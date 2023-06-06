import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserRequest } from './dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post()
    createUser(@Body() createUserRequest: CreateUserRequest) {
        this.appService.createUser(createUserRequest);
    }
}
