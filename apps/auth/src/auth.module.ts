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
import { COMMUNICATIONS_SERVICE } from '@app/common/constants';
import { AuthHealthIndicator } from './auth.health';

@Module({
    imports: [
        AppConfigModule,
        UsersModule,
        OtpModule,
        JwtModule.register({}),
        RedisCacheModule,
        RabbitMQModule,
        RabbitMQModule.registerRmq(
            COMMUNICATIONS_SERVICE,
            process.env.RABBITMQ_COMMUNICATIONS_QUEUE,
        ),
    ],
    controllers: [AuthController],
    providers: [
        AuthHealthIndicator,
        JwtGuard,
        RabbitMQService,
        AuthService,
        AccessTokenStrategy,
        GoogleStrategy,
        FacebookStrategy,
    ],
})
export class AuthModule {}
