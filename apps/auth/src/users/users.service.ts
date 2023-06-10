import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserRequest } from './dtos';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(request: CreateUserRequest) {
        await this.validateCreateUserRequest(request);
        const user = await this.usersRepository.create({
            ...request,
            password: await bcrypt.hash(request.password, 10),
        });
        return user;
    }

    private async validateCreateUserRequest(request: CreateUserRequest) {
        let user: User;
        try {
            user = await this.usersRepository.findOne({
                email: request.email,
            });
        } catch (err) {}

        if (user) {
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
}
