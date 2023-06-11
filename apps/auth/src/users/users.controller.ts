import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from './dtos';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(@Body() request: CreateUserDTO) {
        return this.usersService.createUser(request);
    }
}
