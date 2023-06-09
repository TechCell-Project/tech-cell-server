import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { RabbitMQModule, RabbitMQService } from '@app/common';

@Module({
    imports: [RabbitMQModule],
    controllers: [AuthController],
    providers: [RabbitMQService, AuthService],
})
export class AuthModule {}
