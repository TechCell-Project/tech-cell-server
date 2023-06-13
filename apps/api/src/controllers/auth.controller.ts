import { Controller, Inject, Body, Post, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../../../../constants';
import { catchError, throwError } from 'rxjs';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    UserDataResponseDTO,
    NewTokenRequestDTO,
    BadRequestResponseDTO,
} from '../../../auth/src/dtos';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientProxy) {}

    @ApiBody({ type: LoginRequestDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successfully',
        type: UserDataResponseDTO,
    })
    @ApiResponse({
        status: HttpStatus.FOUND,
        description: 'Login successfully',
        type: UserDataResponseDTO,
    })
    @Post('login')
    async login(@Body() user: LoginRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_login' }, user ? user : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: RegisterRequestDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User created successfully',
        type: UserDataResponseDTO,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'User create failed',
        type: BadRequestResponseDTO,
    })
    @Post('register')
    async register(@Body() user: RegisterRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_register' }, user ? user : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: NewTokenRequestDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'New token created successfully',
        type: UserDataResponseDTO,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Get new token failed',
        type: BadRequestResponseDTO,
    })
    @Post('refresh-token')
    async getNewToken(@Body() { refreshToken }: NewTokenRequestDTO) {
        return this.authService
            .send(
                { cmd: 'auth_get_new_access_token' },
                { refreshToken: refreshToken ? refreshToken : undefined },
            )
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
