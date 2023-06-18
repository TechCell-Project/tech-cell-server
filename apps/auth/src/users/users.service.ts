import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDTO } from './dtos';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(request: CreateUserDTO) {
        await this.validateCreateUserRequest(request);
        const user = await this.usersRepository.create({
            ...request,
            password: await bcrypt.hash(request.password, 10),
        });
        return user;
    }

    private async validateCreateUserRequest(request: CreateUserDTO) {
        const userCount = await this.usersRepository.count({
            email: request.email,
        });

        if (userCount > 0) {
            throw new RpcException(new UnprocessableEntityException('Email already exists.'));
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

    async getUser(getUserArgs: Partial<User>) {
        return this.usersRepository.findOne(getUserArgs);
    }

    async findOneAndUpdateUser(filterQuery: FilterQuery<User>, updateUserArgs: Partial<User>) {
        return this.usersRepository.findOneAndUpdate(filterQuery, updateUserArgs);
    }

    async changeUserPassword(email: string, password: string) {
        return this.usersRepository.findOneAndUpdate(
            { email },
            {
                password: await bcrypt.hash(password, 10),
            },
        );
    }
}
