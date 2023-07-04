import { Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@app/resource/users';
import { AccessTokenStrategy, GoogleStrategy, FacebookStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';
import { MAIL_SERVICE } from '~/constants';
import { OtpModule } from '@app/resource/otp';

@Module({
    imports: [
        RabbitMQModule,
        UsersModule,
        OtpModule,
        JwtModule.register({}),
        RabbitMQModule.registerRmq(MAIL_SERVICE, process.env.RABBITMQ_MAIL_QUEUE),
        RedisCacheModule,
    ],
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
