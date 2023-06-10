import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitMQService, ValidationPipe } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { LoginRequestDto } from './dtos';
import { RpcValidationFilter } from '@app/common';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @Get('ping')
    getPing() {
        return this.authService.getPing();
    }

    @UseFilters(new RpcValidationFilter())
    @MessagePattern({ cmd: 'auth_login' })
    async login(@Ctx() context: RmqContext, @Payload(new ValidationPipe()) user: LoginRequestDto) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { ...user };
    }
}
