import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
    UserDataResponseDTO,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    VerifyEmailRequestDTO,
    LoginRequestDTO,
    CheckEmailRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
} from './dtos';
import { UsersService } from './users/users.service';
import { JwtGuard } from './guards/jwt.guard';
import { IUserFacebookResponse, IUserGoogleResponse } from './interfaces';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        @Inject(UsersService) private readonly usersService: UsersService,
    ) {}

    @Get('ping')
    getPing() {
        return this.authService.getPing();
    }

    @MessagePattern({ cmd: 'auth_login' })
    async login(@Ctx() context: RmqContext, @Payload() { email, password }: LoginRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.login({ email, password });
    }

    @MessagePattern({ cmd: 'auth_check_email' })
    async checkEmail(@Ctx() context: RmqContext, @Payload() { email }: CheckEmailRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.checkEmail({ email });
    }

    @MessagePattern({ cmd: 'auth_register' })
    async register(
        @Ctx() context: RmqContext,
        @Payload() { email, firstName, lastName, password, re_password }: RegisterRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.register({ email, firstName, lastName, password, re_password });
    }

    @MessagePattern({ cmd: 'auth_verify_email' })
    async verifyEmail(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode }: VerifyEmailRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyEmail({ email, otpCode });
    }

    @MessagePattern({ cmd: 'auth_get_new_access_token' })
    async getNewToken(
        @Ctx() context: RmqContext,
        @Payload() { refreshToken }: NewTokenRequestDTO,
    ): Promise<UserDataResponseDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.getNewToken({ refreshToken });
    }

    @MessagePattern({ cmd: 'verify-jwt' })
    @UseGuards(JwtGuard)
    async verifyJwt(@Ctx() context: RmqContext, @Payload() payload: { jwt: string }) {
        this.rabbitMqService.acknowledgeMessage(context);

        return this.authService.verifyAccessToken(payload.jwt);
    }

    @MessagePattern({ cmd: 'auth_forgot_password' })
    async forgotPassword(@Ctx() context: RmqContext, @Payload() { email }: ForgotPasswordDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.forgotPassword({ email });
    }

    @MessagePattern({ cmd: 'auth_verify_forgot_password' })
    async verifyForgotPassword(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode, password, re_password }: VerifyForgotPasswordDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyForgotPassword({ email, otpCode, password, re_password });
    }

    @MessagePattern({ cmd: 'auth_google_login' })
    async googleAuthRedirect(@Ctx() context, @Payload() { user }: { user: IUserGoogleResponse }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.googleLogin({ user });
    }

    @MessagePattern({ cmd: 'auth_facebook_login' })
    async facebookAuthRedirect(
        @Ctx() context,
        @Payload() { user }: { user: IUserFacebookResponse },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.facebookLogin({ user });
    }
}
