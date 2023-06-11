import { Controller, Inject, Body, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../../../../constants';
import { catchError, throwError } from 'rxjs';
import { RegisterRequestDTO } from '../../../auth/src/dtos';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientProxy) {}

    @Post('login')
    async login(@Body() user: { email: string; password: string }) {
        return this.authService
            .send({ cmd: 'auth_login' }, user ? user : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @Post('register')
    async register(@Body() user: RegisterRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_register' }, user ? user : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
