import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '~libs/resource/abstract';
import { User } from './schemas';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
    protected readonly logger = new Logger(UsersRepository.name);

    constructor(
        @InjectModel(User.name) userModel: Model<User>,
        @InjectConnection() connection: Connection,
    ) {
        super(userModel, connection);
    }
}
