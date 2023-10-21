import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQModule, RabbitMQService } from '@app/common/RabbitMQ';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@app/resource/users';
import { AccessTokenStrategy, GoogleStrategy, FacebookStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';
import { OtpModule } from '@app/resource/otp';
import { MAIL_SERVICE } from '@app/common/constants';

@Module({
    imports: [
        AppConfigModule,
        UsersModule,
        OtpModule,
        JwtModule.register({}),
        RedisCacheModule,
        RabbitMQModule,
        RabbitMQModule.registerRmq(MAIL_SERVICE, process.env.RABBITMQ_MAIL_QUEUE),
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
