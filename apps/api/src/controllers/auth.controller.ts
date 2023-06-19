import { Controller, Inject, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from '~/constants';
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
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiTooManyRequestsResponse,
    ApiNotAcceptableResponse,
} from '@nestjs/swagger';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    UserDataResponseDTO,
    NewTokenRequestDTO,
    VerifyRegisterRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
    UpdateRegisterRequestDTO,
} from '~/apps/auth/dtos';
import {
    BadRequestResponseDTO,
    UnauthorizedResponseDTO,
    UnprocessableEntityResponseDTO,
    ForbiddenResponseDTO,
} from '~/apps/api/dtos';
import { Throttle } from '@nestjs/throttler';

@ApiTags('authentication')
@ApiTooManyRequestsResponse({ description: 'Too many requests, please try again later' })
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
    @ApiNotAcceptableResponse({ description: 'User need to update their information' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() { email, password }: LoginRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_login' }, { email, password })
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
    async register(@Body() { email }: RegisterRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_register' }, { email })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: RegisterRequestDTO })
    @ApiCreatedResponse({
        description: 'Mail sent',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Your user information is invalid',
        type: BadRequestResponseDTO,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Your account already verified',
        type: UnprocessableEntityResponseDTO,
    })
    @Post('resend-register')
    async resendRegister(@Body() { email }: RegisterRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_resend_register' }, { email })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: VerifyRegisterRequestDTO })
    @ApiOkResponse({ description: 'User email verified' })
    @ApiUnauthorizedResponse({ description: 'Verify failed' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    @ApiConflictResponse({ description: 'User has already been verified.' })
    @Throttle(5, 60) // limit 5 requests per 60 seconds
    @HttpCode(HttpStatus.OK)
    @Post('verify-register')
    async verifyRegister(@Body() { email, otpCode }: VerifyRegisterRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_verify_register' }, { email, otpCode })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: UpdateRegisterRequestDTO })
    @ApiCreatedResponse({ description: 'Update registration successful' })
    @ApiBadRequestResponse({ description: 'Something error' })
    @Post('update-register')
    async updateRegister(
        @Body() { email, firstName, lastName, password, re_password }: UpdateRegisterRequestDTO,
    ) {
        return this.authService
            .send(
                { cmd: 'auth_update_register' },
                { email, firstName, lastName, password, re_password },
            )
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
    @Throttle(3, 60) // limit 3 requests per 60 seconds
    @Post('refresh-token')
    async getNewToken(@Body() { refreshToken }: NewTokenRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_get_new_access_token' }, { refreshToken })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: ForgotPasswordDTO })
    @ApiOkResponse({ description: 'Check your email to verify your password' })
    @ApiBadRequestResponse({ description: 'Your info is invalid' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgotPassword(@Body() { email }: ForgotPasswordDTO) {
        return this.authService
            .send({ cmd: 'auth_forgot_password' }, { email })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @ApiBody({ type: VerifyForgotPasswordDTO })
    @ApiOkResponse({ description: 'Password change successful' })
    @ApiNotFoundResponse({ description: 'Your information is not found' })
    @ApiBadRequestResponse({ description: 'Your information is invalid' })
    @HttpCode(HttpStatus.OK)
    @Post('verify-forgot-password')
    async verifyForgotPassword(
        @Body() { email, otpCode, password, re_password }: VerifyForgotPasswordDTO,
    ) {
        return this.authService
            .send({ cmd: 'auth_verify_forgot_password' }, { email, otpCode, password, re_password })
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
