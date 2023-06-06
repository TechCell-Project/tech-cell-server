import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from './services';
import { AuthsController, UsersController } from './controllers';

@Module({
    imports: [],
    controllers: [AuthsController, UsersController],
    providers: [
        ConfigService,
        {
            provide: 'AUTH_SERVICE',
            useFactory: (configService: ConfigService) => {
                const authServiceOptions = configService.get('authService');
                return ClientProxyFactory.create(authServiceOptions);
            },
            inject: [ConfigService],
        },
        {
            provide: 'USER_SERVICE',
            useFactory: (configService: ConfigService) => {
                const userServiceOptions = configService.get('userService');
                return ClientProxyFactory.create(userServiceOptions);
            },
            inject: [ConfigService],
        },
    ],
})
export class AppModule {}
