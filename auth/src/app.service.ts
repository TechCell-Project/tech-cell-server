import { Injectable } from '@nestjs/common';
import { CreateUserEvent } from './events';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello World!';
    }

    handleUserCreated(data: CreateUserEvent) {
        console.log(`Got event ${data}`);
        return data;
    }
}
