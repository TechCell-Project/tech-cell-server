import { Controller, Get, Inject, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserDataResponseDto, RegisterRequestDTO } from './dtos';
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
        @Payload() user: CreateUserDTO, // : Promise<UserDataResponseDto>
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        const userFound = await this.authService.login({ ...user });
        return userFound;
    }

    @MessagePattern({ cmd: 'auth_register' })
    async register(
        @Ctx() context: RmqContext,
        @Payload() user: RegisterRequestDTO,
    ): Promise<UserDataResponseDto> {
        this.rabbitMqService.acknowledgeMessage(context);
        const userCreated = await this.authService.register(user);
        return new UserDataResponseDto(userCreated);
    }

    @MessagePattern({ cmd: 'verify-jwt' })
    @UseGuards(JwtGuard)
    async verifyJwt(@Ctx() context: RmqContext, @Payload() payload: { jwt: string }) {
        this.rabbitMqService.acknowledgeMessage(context);

        return this.authService.verifyAccessToken(payload.jwt);
    }
}
