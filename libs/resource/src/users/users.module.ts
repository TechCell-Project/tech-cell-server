import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule {}
