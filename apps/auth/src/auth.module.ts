import { Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService, ValidationModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [RabbitMQModule, UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        RabbitMQService,
        AuthService,
        ValidationModule,
        AccessTokenStrategy,
        RefreshTokenStrategy,
    ],
})
export class AuthModule {}
