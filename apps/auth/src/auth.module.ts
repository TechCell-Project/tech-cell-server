import { Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService, ValidationModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';

@Module({
    imports: [RabbitMQModule, UsersModule],
    controllers: [AuthController],
    providers: [RabbitMQService, AuthService, ValidationModule],
})
export class AuthModule {}
