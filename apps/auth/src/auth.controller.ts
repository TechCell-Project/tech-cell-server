import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
    UserDataResponseDTO,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    VerifyEmailRequestDTO,
    LoginRequestDTO,
    EmailRequestDTO,
    ForgotPasswordDTO,
    VerifyForgotPasswordDTO,
    ChangePasswordRequestDTO,
    GoogleLoginRequestDTO,
} from './dtos';
import { JwtGuard } from './guards/jwt.guard';
import { IUserFacebookResponse, IUserGoogleResponse } from './interfaces';
import { AuthMessagePattern } from './auth.pattern';
import { TCurrentUser } from '@app/common/types';
import { AuthHealthIndicator } from './auth.health';

@Controller()
export class AuthController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly authService: AuthService,
        private readonly authHealthIndicator: AuthHealthIndicator,
    ) {}

    @MessagePattern(AuthMessagePattern.isHealthy)
    async isHealthy(@Ctx() context: RmqContext, @Payload() { key }: { key: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authHealthIndicator.isHealthy(key);
    }

    @MessagePattern(AuthMessagePattern.login)
    async login(
        @Ctx() context: RmqContext,
        @Payload() { emailOrUsername, password }: LoginRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.login({ emailOrUsername, password });
    }

    @MessagePattern(AuthMessagePattern.checkEmail)
    async checkEmail(@Ctx() context: RmqContext, @Payload() { email }: EmailRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.checkEmail({ email });
    }

    @MessagePattern(AuthMessagePattern.register)
    async register(
        @Ctx() context: RmqContext,
        @Payload()
        registerArgs: RegisterRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.register({ ...registerArgs });
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

    @MessagePattern(AuthMessagePattern.google)
    async google(@Ctx() context: RmqContext, @Payload() { idToken }: GoogleLoginRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.google(idToken);
    }

    @MessagePattern(AuthMessagePattern.googleAuth)
    async googleAuthRedirect(
        @Ctx() context: RmqContext,
        @Payload() { user }: { user: IUserGoogleResponse },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.googleLogin({ user });
    }

    @MessagePattern(AuthMessagePattern.facebookAuth)
    async facebookAuthRedirect(
        @Ctx() context: RmqContext,
        @Payload() { user }: { user: IUserFacebookResponse },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.facebookLogin({ user });
    }

    @MessagePattern(AuthMessagePattern.resendVerifyEmailOtp)
    async resendVerifyEmailOtp(@Ctx() context, @Payload() { email }: EmailRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.resendVerifyEmailOtp({ email });
    }

    @MessagePattern(AuthMessagePattern.changePassword)
    async changePassword(
        @Ctx() context: RmqContext,
        @Payload()
        {
            changePwData,
            user,
        }: {
            changePwData: ChangePasswordRequestDTO;
            user: TCurrentUser;
        },
    ) {
        console.log({
            changePwData,
            user,
        });
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.changePassword({ changePwData, user });
    }
}
