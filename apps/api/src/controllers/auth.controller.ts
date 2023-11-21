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
import { AUTH_SERVICE } from '~libs/common/constants';
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
    ApiBearerAuth,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    UserDataResponseDTO,
    NewTokenRequestDTO,
    VerifyEmailRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
    EmailRequestDTO,
    ChangePasswordRequestDTO,
    GoogleLoginRequestDTO,
} from '~apps/auth/dtos';
import {
    GoogleOAuthGuard,
    FacebookOAuthGuard,
    IUserFacebookResponse,
    IUserGoogleResponse,
    AuthMessagePattern,
} from '~apps/auth';
import { catchException } from '~libs/common';
import { CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import { AuthGuard } from '~libs/common/guards';
import { ACCESS_TOKEN_NAME } from '~libs/common/constants/api.constant';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiTags('authentication')
@ApiTooManyRequestsResponse({ description: 'Too many requests, please try again later' })
@Controller('auth')
export class AuthController {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientRMQ) {}

    @ApiOperation({
        summary: 'Login',
        description: 'Login',
    })
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
    @ApiForbiddenResponse({
        description: 'Your account has been locked, please contact the administrator',
    })
    @ApiNotFoundResponse({ description: 'Your account email or password is wrong' })
    @ApiNotAcceptableResponse({
        description: 'Email is not verified, please check your email to verify it.',
    })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() { emailOrUsername, password }: LoginRequestDTO) {
        return this.authService
            .send(AuthMessagePattern.login, { emailOrUsername, password })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Check email is exist or not',
        description: 'Check email is exist or not',
    })
    @ApiBody({ type: EmailRequestDTO })
    @ApiOkResponse({ description: 'Email is not in use. Can register' })
    @ApiConflictResponse({
        description: 'User already registered',
    })
    @HttpCode(HttpStatus.OK)
    @Post('check-email')
    async checkEmail(@Body() { email }: EmailRequestDTO) {
        return this.authService
            .send(AuthMessagePattern.checkEmail, { email })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Register new user',
        description: 'Register new user',
    })
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
        @Body() { email, userName, firstName, lastName, password, re_password }: RegisterRequestDTO,
    ) {
        return this.authService
            .send(AuthMessagePattern.register, {
                email,
                userName,
                firstName,
                lastName,
                password,
                re_password,
            })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Verify email registration',
        description: 'Verify email registration',
    })
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
            .send(AuthMessagePattern.verifyEmail, { email, otpCode })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Resend verify email otp',
        description: 'Resend verify email otp',
    })
    @ApiBody({ type: EmailRequestDTO })
    @ApiOkResponse({
        description: 'An email has already been sent to you email address, please check your email',
    })
    @ApiNotFoundResponse({ description: 'Email not found' })
    @ApiBadRequestResponse({ description: 'Email has already been verified.' })
    @Throttle(5, 60) // limit 5 requests per 60 seconds
    @HttpCode(HttpStatus.OK)
    @Post('resend-verify-email-otp')
    async resendVerifyEmailOtp(@Body() { email }: EmailRequestDTO) {
        return this.authService
            .send(AuthMessagePattern.resendVerifyEmailOtp, { email })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get new token',
        description: 'Get new token',
    })
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
            .send(AuthMessagePattern.getNewToken, { refreshToken })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Forgot password',
        description: 'Forgot password',
    })
    @ApiBody({ type: ForgotPasswordDTO })
    @ApiOkResponse({ description: 'Check your email to verify your password' })
    @ApiBadRequestResponse({ description: 'Your info is invalid' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgotPassword(@Body() { email }: ForgotPasswordDTO) {
        return this.authService
            .send(AuthMessagePattern.forgotPassword, { email })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Verify forgot password',
        description: 'Verify forgot password',
    })
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
            .send(AuthMessagePattern.verifyForgotPassword, {
                email,
                otpCode,
                password,
                re_password,
            })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Change password',
        description: 'Change password',
    })
    @ApiBody({ type: ChangePasswordRequestDTO })
    @ApiOkResponse({ description: 'Password change successful' })
    @ApiNotFoundResponse({ description: 'Your information is not found' })
    @ApiBadRequestResponse({ description: 'Your information is invalid' })
    @ApiBearerAuth(ACCESS_TOKEN_NAME)
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('change-password')
    async changePassword(
        @Body() changePwData: ChangePasswordRequestDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return this.authService
            .send(AuthMessagePattern.changePassword, { changePwData, user })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Login with google',
        description: 'Login with google',
    })
    @ApiOkResponse({
        type: UserDataResponseDTO,
    })
    @ApiUnauthorizedResponse({ description: 'Your information is invalid' })
    @HttpCode(HttpStatus.OK)
    @Post('/google')
    async google(@Body() { idToken }: GoogleLoginRequestDTO) {
        return this.authService.send(AuthMessagePattern.google, { idToken }).pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @ApiOkResponse({
        type: UserDataResponseDTO,
    })
    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Request() { user }: { user: IUserGoogleResponse }) {
        return this.authService
            .send(AuthMessagePattern.googleAuth, { user })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @ApiOAuth2(['email'], 'login with facebook  ')
    @ApiOkResponse({
        type: UserDataResponseDTO,
    })
    @Get('facebook')
    @UseGuards(FacebookOAuthGuard)
    async facebookAuth(@Request() { user }: { user: IUserFacebookResponse }) {
        return this.authService
            .send(AuthMessagePattern.facebookAuth, { user })
            .pipe(catchException());
    }
}
