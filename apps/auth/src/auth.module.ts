import { Module } from '@nestjs/common';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@app/resource/users';
import { AccessTokenStrategy, GoogleStrategy, FacebookStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';
import { OtpModule } from '@app/resource/otp';

@Module({
    imports: [UsersModule, OtpModule, JwtModule.register({}), RedisCacheModule],
    controllers: [AuthController],
    providers: [
        JwtGuard,
        RabbitMQService,
        AuthService,
        AccessTokenStrategy,
        GoogleStrategy,
        FacebookStrategy,
    ],
})
export class AuthModule {}
