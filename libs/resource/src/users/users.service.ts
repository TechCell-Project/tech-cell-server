import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDTO } from './dtos';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser({
        email,
        userName,
        firstName,
        lastName,
        password,
        emailVerified,
    }: CreateUserDTO & { emailVerified?: boolean }) {
        await this.validateCreateUserRequest({ email, userName });
        return this.usersRepository.create({
            email,
            userName,
            firstName,
            lastName,
            emailVerified: emailVerified ?? false,
            password: await this.hashPassword({ password }),
        });
    }

    private async validateCreateUserRequest({
        email,
        userName,
    }: {
        email: string;
        userName: string;
    }) {
        const [emailCount, userNameCount] = await Promise.all([
            this.usersRepository.count({
                email: email,
            }),
            this.usersRepository.count({
                userName: userName,
            }),
        ]);

        if (emailCount > 0) {
            throw new RpcException(new UnprocessableEntityException('Email already exists.'));
        }

        if (userNameCount > 0) {
            throw new RpcException(new UnprocessableEntityException('Username already exists.'));
        }
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersRepository.findOne({ email });
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            throw new RpcException(new UnauthorizedException('Credentials are not valid.'));
        }
        return user;
    }

    /**
     *
     * @param getUserArgs
     * @returns User if the user exists, otherwise throw an exception
     */
    async getUser(
        getUserArgs: Partial<User>,
        queryArgs?: Partial<QueryOptions<User>>,
        projectionArgs?: Partial<ProjectionType<User>>,
    ) {
        return this.usersRepository.findOne(getUserArgs, queryArgs, projectionArgs);
    }

    async getUsers(
        getUserArgs: Partial<User>,
        queryArgs?: Partial<QueryOptions<User>>,
        projectionArgs?: Partial<ProjectionType<User>>,
    ) {
        return this.usersRepository.find({
            filterQuery: getUserArgs,
            queryOptions: queryArgs,
            projection: projectionArgs,
        });
    }

    async findOneAndUpdateUser(filterQuery: FilterQuery<User>, updateUserArgs: Partial<User>) {
        return this.usersRepository.findOneAndUpdate(filterQuery, updateUserArgs);
    }

    async changeUserPassword({ email, password }: { email: string; password: string }) {
        return this.usersRepository.findOneAndUpdate(
            { email },
            {
                password: await this.hashPassword({ password }),
            },
        );
    }

    async countUser(filterQuery: FilterQuery<User>) {
        return await this.usersRepository.count(filterQuery);
    }

    async hashPassword({ password }: { password: string }) {
        return await bcrypt.hash(password, 10);
    }

    async countUsers(filterQuery: FilterQuery<User>) {
        return this.usersRepository.count(filterQuery);
    }
}
