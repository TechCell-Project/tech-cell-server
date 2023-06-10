import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Inject,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService, ValidationPipe } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserDataResponseDto } from './dtos';
import { CreateUserRequest } from './users/dtos';
import { RpcValidationFilter } from '@app/common';
import { UsersService } from './users/users.service';

@UseInterceptors(ClassSerializerInterceptor)
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

    @UseFilters(new RpcValidationFilter())
    @MessagePattern({ cmd: 'auth_login' })
    async login(
        @Ctx() context: RmqContext,
        @Payload(new ValidationPipe()) user: CreateUserRequest,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { ...user };
    }

    @UseFilters(new RpcValidationFilter())
    @MessagePattern({ cmd: 'auth_signup' })
    async signup(
        @Ctx() context: RmqContext,
        @Payload(new ValidationPipe()) user: CreateUserRequest,
    ): Promise<UserDataResponseDto> {
        this.rabbitMqService.acknowledgeMessage(context);
        const userCreated = await this.usersService.createUser(user);
        return new UserDataResponseDto(userCreated);
    }
}
