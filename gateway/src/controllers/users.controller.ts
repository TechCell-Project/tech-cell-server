import { Controller, Post, Put, Get, Body, Req, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { IServiceUserGetManyResponse } from '../interfaces/user';
// import { IAuthorizedRequest } from '../interfaces/common';

@Controller('users')
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy) {}

    @Get()
    public async getUsers() {
        const userResponse: IServiceUserGetManyResponse = await firstValueFrom(
            this.userServiceClient.send('user_get_many', {}),
        );

        return {
            message: userResponse.message,
            data: {
                users: userResponse.users,
            },
            errors: null,
        };
    }
}
