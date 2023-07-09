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
import { UsersService } from '@app/resource/users';
import { JwtGuard } from './guards/jwt.guard';
import { IUserFacebookResponse, IUserGoogleResponse } from './interfaces';
import { AuthMessagePattern } from './auth.pattern';

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

    @MessagePattern(AuthMessagePattern.login)
    async login(@Ctx() context: RmqContext, @Payload() { email, password }: LoginRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.login({ email, password });
    }

    @MessagePattern(AuthMessagePattern.checkEmail)
    async checkEmail(@Ctx() context: RmqContext, @Payload() { email }: CheckEmailRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.checkEmail({ email });
    }

    @MessagePattern(AuthMessagePattern.register)
    async register(
        @Ctx() context: RmqContext,
        @Payload() { email, firstName, lastName, password, re_password }: RegisterRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.register({ email, firstName, lastName, password, re_password });
    }

    @MessagePattern(AuthMessagePattern.verifyEmail)
    async verifyEmail(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode }: VerifyEmailRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyEmail({ email, otpCode });
    }

    @MessagePattern(AuthMessagePattern.getNewToken)
    async getNewToken(
        @Ctx() context: RmqContext,
        @Payload() { refreshToken }: NewTokenRequestDTO,
    ): Promise<UserDataResponseDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.getNewToken({ refreshToken });
    }

    @MessagePattern(AuthMessagePattern.verifyJwt)
    @UseGuards(JwtGuard)
    async verifyJwt(@Ctx() context: RmqContext, @Payload() payload: { jwt: string }) {
        this.rabbitMqService.acknowledgeMessage(context);

        return this.authService.verifyAccessToken(payload.jwt);
    }

    @MessagePattern(AuthMessagePattern.forgotPassword)
    async forgotPassword(@Ctx() context: RmqContext, @Payload() { email }: ForgotPasswordDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.forgotPassword({ email });
    }

    @MessagePattern(AuthMessagePattern.verifyForgotPassword)
    async verifyForgotPassword(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode, password, re_password }: VerifyForgotPasswordDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyForgotPassword({ email, otpCode, password, re_password });
    }

    @MessagePattern(AuthMessagePattern.googleAuth)
    async googleAuthRedirect(@Ctx() context, @Payload() { user }: { user: IUserGoogleResponse }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.googleLogin({ user });
    }

    @MessagePattern(AuthMessagePattern.facebookAuth)
    async facebookAuthRedirect(
        @Ctx() context,
        @Payload() { user }: { user: IUserFacebookResponse },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.facebookLogin({ user });
    }
}
