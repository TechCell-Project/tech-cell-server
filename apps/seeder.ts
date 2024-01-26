import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '~libs/resource/users';
import { UsersSeeder } from '~libs/resource/users/users.seeder';
import { MongodbModule } from '~libs/common/database';
import { AppConfigModule } from '~libs/common/appConfig';

seeder({
    imports: [
        AppConfigModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
}).run([UsersSeeder]);
