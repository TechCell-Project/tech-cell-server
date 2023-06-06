import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserService } from './services';

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
