import { UsersService } from '@app/resource';
import { Inject, Injectable } from '@nestjs/common';
import { delStartWith } from '@app/common/utils';
import {
    REDIS_CACHE,
    USERS_CACHE_PREFIX,
    USERS_ALL,
    USERS_PAGESIZE,
    USERS_PAGE,
} from '~/constants';
import { Store } from 'cache-manager';

@Injectable()
export class UsersSearchUtilService {
    constructor(
        protected readonly usersService: UsersService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

    protected buildCacheKeyUsers({
        page,
        pageSize,
        all,
    }: {
        page?: number;
        pageSize?: number;
        all?: boolean;
    }) {
        const arrCacheKey = [];

        if (all) {
            return USERS_ALL;
        }

        if (page) {
            arrCacheKey.push(`${USERS_PAGE}_${page}`);
        }

        if (pageSize) {
            arrCacheKey.push(`${USERS_PAGESIZE}_${pageSize}`);
        }

        return arrCacheKey.join('_');
    }

    /**
     *
     * @returns remove all users cache
     */
    protected async delCacheUsers() {
        return await delStartWith(USERS_CACHE_PREFIX, this.cacheManager);
    }
}
