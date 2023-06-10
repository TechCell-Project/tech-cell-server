import { Controller, Inject, Body, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../../../../constants';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientProxy) {}

    @Post('login')
    async login(@Body() user: { email: string; password: string }) {
        return this.authService.send({ cmd: 'auth_login' }, user ? user : undefined);
    }

    @Post('signup')
    async signup(@Body() user: { email: string; password: string }) {
        console.log('[API] ');
        console.log(user);
        return this.authService.send({ cmd: 'auth_signup' }, user ? user : undefined);
    }
}
