import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ListDataResponseDTO } from '@app/common/dtos';
import { timeStringToMs } from '@app/common/utils';
import { GetUsersDTO, QueryUserParamsDTO } from './dtos';
import { buildCacheKeyUsers } from '@app/resource/users/utils';
import { REDIS_CACHE } from '~/constants';
import { UsersService } from '@app/resource/users';
import { Store } from 'cache-manager';

@Injectable()
export class UsersSearchService {
    constructor(
        private readonly usersService: UsersService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        private readonly logger: Logger,
    ) {
        this.logger = new Logger(UsersSearchService.name);
    }

    async getUsers({ page = 1, pageSize = 10, ...payload }: QueryUserParamsDTO) {
        const { all } = payload;

        if (typeof page !== 'number') {
            page = Number(page);
        }

        if (typeof pageSize !== 'number') {
            pageSize = Number(pageSize);
        }

        const query: GetUsersDTO = {};
        const options = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize || 10,
        };

        const cacheKey = buildCacheKeyUsers({ page, pageSize, all });
        const usersFromCache = await this.cacheManager.get(cacheKey);
        if (usersFromCache) {
            this.logger.log(`CACHE HIT: ${cacheKey}`);
            return usersFromCache;
        }

        if (all) {
            delete options.limit;
            delete options.skip;
        }

        this.logger.warn(`CACHE MISS: ${cacheKey}`);
        const [usersFromDb, totalRecord] = await Promise.all([
            this.usersService.getUsers({ ...query }, { ...options }, ['-password']),
            this.usersService.countUsers({}),
        ]);

        const dataResponse = new ListDataResponseDTO({
            data: usersFromDb,
            page: all ? 1 : page,
            pageSize: all ? totalRecord : pageSize,
            totalPage: all ? 1 : Math.ceil(totalRecord / pageSize),
            totalRecord,
        });

        await this.cacheManager.set(cacheKey, dataResponse, timeStringToMs('1h'));
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
