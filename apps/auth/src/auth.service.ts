import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    getPing() {
        return { message: 'pong', services: 'auth' };
    }
}
