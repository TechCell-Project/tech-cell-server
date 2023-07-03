import {
    Controller,
    Inject,
    Body,
    Post,
    HttpCode,
    HttpStatus,
    Get,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { AUTH_SERVICE } from '~/constants';
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
    ApiOAuth2,
} from '@nestjs/swagger';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    UserDataResponseDTO,
    NewTokenRequestDTO,
    VerifyEmailRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
    CheckEmailRequestDTO,
} from '~/apps/auth/dtos';
import { Throttle } from '@nestjs/throttler';
import { GoogleOAuthGuard, FacebookOAuthGuard } from '~/apps/auth/guards';
import { IUserFacebookResponse, IUserGoogleResponse } from '~/apps/auth/interfaces';
import { catchException } from '@app/common';

@ApiTags('authentication')
@ApiTooManyRequestsResponse({ description: 'Too many requests, please try again later' })
@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientRMQ) {}

    @ApiBody({ type: LoginRequestDTO })
    @ApiOkResponse({
        description: 'Login successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Your account email or password is invalid',
    })
    @ApiUnauthorizedResponse({
        description: 'Your account email or password is wrong',
    })
    @ApiNotAcceptableResponse({ description: 'User need to update their information' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() { email, password }: LoginRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_login' }, { email, password })
            .pipe(catchException());
    }

    @ApiBody({ type: CheckEmailRequestDTO })
    @ApiOkResponse({ description: 'Email is not in use. Can register' })
    @ApiConflictResponse({
        description: 'User already registered',
        type: UserDataResponseDTO,
    })
    @HttpCode(HttpStatus.OK)
    @Post('check-email')
    async checkEmail(@Body() { email }: CheckEmailRequestDTO) {
        return this.authService.send({ cmd: 'auth_check_email' }, { email }).pipe(catchException());
    }

    @ApiBody({ type: RegisterRequestDTO })
    @ApiCreatedResponse({
        description: 'User created successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Your user information is invalid',
    })
    @ApiUnprocessableEntityResponse({
        description: 'Your account already exists',
    })
    @Post('register')
    async register(
        @Body() { email, firstName, lastName, password, re_password }: RegisterRequestDTO,
    ) {
        return this.authService
            .send({ cmd: 'auth_register' }, { email, firstName, lastName, password, re_password })
            .pipe(catchException());
    }

    @ApiBody({ type: VerifyEmailRequestDTO })
    @ApiOkResponse({ description: 'Email verified' })
    @ApiUnauthorizedResponse({ description: 'Email verify failed' })
    @ApiNotFoundResponse({ description: 'Email not found.' })
    @ApiConflictResponse({ description: 'Email has already been verified.' })
    @Throttle(5, 60) // limit 5 requests per 60 seconds
    @HttpCode(HttpStatus.OK)
    @Post('verify-email')
    async verifyEmail(@Body() { email, otpCode }: VerifyEmailRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_verify_email' }, { email, otpCode })
            .pipe(catchException());
    }

    @ApiBody({ type: NewTokenRequestDTO })
    @ApiCreatedResponse({
        description: 'New token created successfully',
        type: UserDataResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Your information is invalid',
    })
    @ApiForbiddenResponse({
        description: 'Your refreshToken token invalid, can not get new token',
    })
    @Throttle(3, 60) // limit 3 requests per 60 seconds
    @Post('refresh-token')
    async getNewToken(@Body() { refreshToken }: NewTokenRequestDTO) {
        return this.authService
            .send({ cmd: 'auth_get_new_access_token' }, { refreshToken })
            .pipe(catchException());
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
            .pipe(catchException());
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
            .pipe(catchException());
    }

    @ApiOAuth2(['openid', 'profile', 'email'], 'login with google')
    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Request() { user }: { user: IUserGoogleResponse }) {
        return this.authService.send({ cmd: 'auth_google_login' }, { user }).pipe(catchException());
    }

    @ApiOAuth2(['email'], 'login with facebook')
    @Get('facebook')
    @UseGuards(FacebookOAuthGuard)
    async facebookAuth(@Request() { user }: { user: IUserFacebookResponse }) {
        return this.authService
            .send({ cmd: 'auth_facebook_login' }, { user })
            .pipe(catchException());
    }
}
