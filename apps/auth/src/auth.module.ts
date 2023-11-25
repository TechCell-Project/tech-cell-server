import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQModule, RabbitMQService } from '~libs/common/RabbitMQ';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '~libs/resource/users';
import { AccessTokenStrategy, GoogleStrategy, FacebookStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';
import { OtpModule } from '~libs/resource/otp';
import { COMMUNICATIONS_SERVICE } from '~libs/common/constants';
import { AuthHealthIndicator } from './auth.health';

@Module({
    imports: [
        AppConfigModule,
        UsersModule,
        OtpModule,
        JwtModule.register({}),
        RedisModule,
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
