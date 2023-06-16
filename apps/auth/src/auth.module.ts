import { Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { AccessTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';

@Module({
    imports: [RabbitMQModule, UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [JwtGuard, RabbitMQService, AuthService, AccessTokenStrategy],
})
export class AuthModule {}
