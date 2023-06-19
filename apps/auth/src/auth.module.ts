import { Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { AccessTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards';
import { MAIL_SERVICE } from '~/constants';
import { OtpModule } from './otp';

@Module({
    imports: [
        RabbitMQModule,
        UsersModule,
        OtpModule,
        JwtModule.register({}),
        RabbitMQModule.registerRmq(MAIL_SERVICE, process.env.RABBITMQ_MAIL_QUEUE),
    ],
    controllers: [AuthController],
    providers: [JwtGuard, RabbitMQService, AuthService, AccessTokenStrategy],
})
export class AuthModule {}
