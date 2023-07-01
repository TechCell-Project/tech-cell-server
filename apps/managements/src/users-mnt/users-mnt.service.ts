import { UsersService } from '@app/resource';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { GetUsersDTO } from './dtos';
import { capitalize } from '@app/common/utils';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersMntService {
    constructor(private readonly usersService: UsersService) {}

    async getUsers(payload: GetUsersDTO) {
        const {
            email,
            isBlocked,
            isDeleted,
            isVerified,
            role,
            search,
            status,
            limit = 10,
            offset = 0,
            order = 'asc',
            sort = 'createdAt',
        } = payload;
        const query: GetUsersDTO = {};

        if (email) {
            query.email = email;
        }

        if (typeof isBlocked !== 'undefined') {
            query.isBlocked = isBlocked;
        }

        if (typeof isDeleted !== 'undefined') {
            query.isDeleted = isDeleted;
        }

        if (typeof isVerified !== 'undefined') {
            query.isVerified = isVerified;
        }

        if (status) {
            query.status = status;
        }

        if (role) {
            query.role = capitalize(role);
        }

        if (search) {
            // Add any specific logic for search filtering, if needed
            // e.g., query.search = search;
        }

        return await this.usersService.getUsers(
            { role: query.role, ...query },
            { limit, offset, order, sort },
            ['-password'],
        );
    }

    async getUserById(id: string | Types.ObjectId | any) {
        try {
            const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            return await this.usersService.getUser({ _id: idSearch }, {}, ['-password']);
        } catch (error) {
            throw new RpcException(new BadRequestException('User Id is invalid'));
        }
    }
}
