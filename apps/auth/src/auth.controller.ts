import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
    UserDataResponseDTO,
    RegisterRequestDTO,
    NewTokenRequestDTO,
    RegisterResponseDTO,
    VerifyRegisterRequestDTO,
} from './dtos';
import { CreateUserDTO } from './users/dtos';
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
        @Payload() user: CreateUserDTO,
    ): Promise<UserDataResponseDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.login({ ...user });
    }

    @MessagePattern({ cmd: 'auth_register' })
    async register(
        @Ctx() context: RmqContext,
        @Payload() user: RegisterRequestDTO, // : Promise<RegisterResponseDTO>
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.register(user);
    }

    @MessagePattern({ cmd: 'auth_verify_register' })
    async verifyRegister(
        @Ctx() context: RmqContext,
        @Payload() { email, otpCode }: VerifyRegisterRequestDTO, // : Promise<RegisterResponseDTO>
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.authService.verifyRegister({ email, otpCode });
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
}
