import { RpcException } from '@nestjs/microservices';
import { FilterQuery, ProjectionFields, QueryOptions, Types } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { GetUsersQueryDTO } from './dtos';
import { User } from '~libs/resource/users';
import { UsersSearchUtilService } from './users-search.util.service';

@Injectable()
export class UsersSearchService extends UsersSearchUtilService {
    async getUsers(payload: GetUsersQueryDTO) {
        const { page = 1, pageSize = 10 } = payload;

        const filterQuery: FilterQuery<User> = this.buildFilterQuery(payload);
        const queryOptions: QueryOptions<User> = this.buildQueryOptions(payload);
        const projection: ProjectionFields<User> = ['-password'];

        const [usersFromDb, totalRecord] = await Promise.all([
            this.usersService.getUsers(filterQuery, queryOptions, projection),
            this.usersService.countUsers(filterQuery),
        ]);

        const dataResponse = new ListDataResponseDTO({
            data: usersFromDb,
            page: page,
            pageSize: pageSize,
            totalPage: Math.ceil(totalRecord / pageSize),
            totalRecord,
        });

        return dataResponse;
    }

    async getUserById(id: string) {
        try {
            const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            return await this.usersService.getUser({ _id: idSearch }, {}, ['-password']);
        } catch (error) {
            throw new RpcException(new BadRequestException('User Id is invalid'));
        }
    }
}
