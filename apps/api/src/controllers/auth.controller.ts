import { Controller, Inject, Body, Post } from '@nestjs/common';
import {
    ApiTags,
    ApiBody,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
    @ApiOkResponse({
        description: 'Login successfully',
        type: UserDataResponseDTO,
    })
    @ApiUnauthorizedResponse({
        description: 'Can not login',
    })
    @Post('login')
    async login(@Body() user: LoginRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_login' }, user ? user : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: RegisterRequestDTO })
    @ApiCreatedResponse({
        description: 'User created successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
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
    @ApiCreatedResponse({
        description: 'New token created successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
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
