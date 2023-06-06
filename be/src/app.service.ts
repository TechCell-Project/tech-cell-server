import { Inject, Injectable } from '@nestjs/common';
import { CreateUserRequest } from './dto';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserEvent } from './events';

@Injectable()
export class AppService {
    private readonly users: any[] = [];

    constructor(@Inject('AUTH') private readonly authClient: ClientProxy) {}

    getHello(): string {
        return 'Hello World!';
    }

    createUser(createUserRequest: CreateUserRequest) {
        this.users.push(createUserRequest);
        this.authClient.emit(
            'user_created',
            new CreateUserEvent(createUserRequest.email, createUserRequest.password),
        );
    }
}
