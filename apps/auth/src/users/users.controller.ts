import { Body, Controller, Post, Get } from '@nestjs/common';
import { CreateUserRequest } from './dtos';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(@Body() request: CreateUserRequest) {
        return this.usersService.createUser(request);
    }
}
