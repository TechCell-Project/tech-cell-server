import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDTO } from './dtos';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        @I18n() private readonly i18n: I18nService<I18nTranslations>,
    ) {}

    /**
     * create a new user, password will be hashed here before saving to database
     * @param user the user to be created
     * @returns the created user
     */
    public async createUser(user: CreateUserDTO) {
        await this.isEmailOrUsernameExist({ email: user.email, userName: user.userName });
        return this.usersRepository.create({
            ...user,
            password: await this.hashPassword({ password: user.password }),
        });
    }

    private async isEmailOrUsernameExist({ email, userName }: { email: string; userName: string }) {
        const [emailCount, userNameCount] = await Promise.all([
            this.usersRepository.count({
                email: email,
            }),
            this.usersRepository.count({
                userName: userName,
            }),
        ]);

        if (emailCount > 0) {
            throw new RpcException(
                new UnprocessableEntityException(
                    this.i18n.t('errorMessage.PROPERTY_IS_EXISTS', {
                        args: {
                            property: 'Email',
                        },
                    }),
                ),
            );
        }

        if (userNameCount > 0) {
            throw new RpcException(
                new UnprocessableEntityException(
                    this.i18n.t('errorMessage.PROPERTY_IS_EXISTS', {
                        args: {
                            property: 'Username',
                        },
                    }),
                ),
            );
        }
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
        getUserArgs: Partial<FilterQuery<User>>,
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
                updatedAt: new Date(),
            },
        );
    }

    async countUser(filterQuery: FilterQuery<User>) {
        return await this.usersRepository.count(filterQuery);
    }

    private async hashPassword({ password }: { password: string }) {
        return await bcrypt.hash(password, 10);
    }

    async countUsers(filterQuery: FilterQuery<User>) {
        return this.usersRepository.count(filterQuery);
    }

    async isUserNameExist(userName: string): Promise<boolean> {
        return (await this.usersRepository.count({ userName })) > 0;
    }

    public async isImageInUse(publicId: string): Promise<boolean> {
        return (await this.usersRepository.count({ 'avatar.publicId': publicId })) > 0;
    }
}
