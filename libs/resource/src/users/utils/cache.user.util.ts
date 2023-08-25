import { delStartWith } from '@app/common/utils';
import { USERS_ALL, USERS_CACHE_PREFIX, USERS_PAGE, USERS_PAGESIZE } from '~/constants';

export function buildCacheKeyUsers({
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
export async function delCacheUsers() {
    return await delStartWith(USERS_CACHE_PREFIX, this.cacheManager);
}
