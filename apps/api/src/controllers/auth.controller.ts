import { Controller, Inject, Body, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../../../../constants';
import { catchError, throwError } from 'rxjs';
import {
    ApiTags,
    ApiBody,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    UserDataResponseDTO,
    NewTokenRequestDTO,
} from '../../../auth/src/dtos';
import {
    BadRequestResponseDTO,
    UnauthorizedResponseDTO,
    UnprocessableEntityResponseDTO,
    ForbiddenResponseDTO,
} from '../dtos';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientProxy) {}

    @ApiBody({ type: LoginRequestDTO })
    @ApiOkResponse({
        description: 'Login successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Your account email or password is invalid',
        type: BadRequestResponseDTO,
    })
    @ApiUnauthorizedResponse({
        description: 'Your account email or password is wrong',
        type: UnauthorizedResponseDTO,
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
        description: 'Your user information is invalid',
        type: BadRequestResponseDTO,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Your account already exists',
        type: UnprocessableEntityResponseDTO,
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
        description: 'Your information is invalid',
        type: BadRequestResponseDTO,
    })
    @ApiForbiddenResponse({
        description: 'Your refreshToken token invalid, can not get new token',
        type: ForbiddenResponseDTO,
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
