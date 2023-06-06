import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from './services';
import { UsersController } from './controllers';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [
        ConfigService,
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
