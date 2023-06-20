import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
    UserDataResponseDTO,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    VerifyRegisterRequestDTO,
    VerifyForgotPasswordDTO,
    UpdateRegisterRequestDTO,
    LoginRequestDTO,
    ForgotPasswordDTO,
} from './dtos';
import { UsersService } from './users/users.service';
import { JwtGuard } from './guards/jwt.guard';

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
    async login(
        @Ctx() context: RmqContext,
        @Payload() { email, password }: LoginRequestDTO,
    ): Promise<UserDataResponseDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.login({ email, password });
    }

    @MessagePattern({ cmd: 'auth_register' })
    async register(@Ctx() context: RmqContext, @Payload() { email }: RegisterRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.register({ email });
    }

    @MessagePattern({ cmd: 'auth_resend_register' })
    async resendRegister(@Ctx() context: RmqContext, @Payload() { email }: RegisterRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.resendRegister({ email });
    }

    @MessagePattern({ cmd: 'auth_verify_register' })
    async verifyRegister(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode }: VerifyRegisterRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyRegister({ email, otpCode });
    }

    @MessagePattern({ cmd: 'auth_update_register' })
    async updateRegister(
        @Ctx() context: RmqContext,
        @Payload() { email, firstName, lastName, password, re_password }: UpdateRegisterRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.updateRegister({
            email,
            firstName,
            lastName,
            password,
            re_password,
        });
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

    // @MessagePattern({ cmd: 'auth_forgot_password' })
    // async forgotPassword(@Ctx() context: RmqContext, @Payload() { email }: ForgotPasswordDTO) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return this.authService.forgotPassword({ email });
    // }

    @MessagePattern({ cmd: 'auth_verify_forgot_password' })
    async verifyForgotPassword(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode, password, re_password }: VerifyForgotPasswordDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyForgotPassword({ email, otpCode, password, re_password });
    }
}
