import { isTrueSet } from '@app/common/utils';
import { PaginationQuery } from '@app/common/dtos';
import { Cart, CartsService } from '@app/resource/carts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Store } from 'cache-manager';
import { QueryOptions } from 'mongoose';
import { REDIS_CACHE } from '~/constants/cache.constant';

@Injectable()
export class CartsSearchService {
    constructor(
        private readonly cartsService: CartsService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        private readonly logger: Logger,
    ) {
        this.logger = new Logger(CartsSearchService.name);
    }

    async getCarts({ no_limit = false, page = 1, pageSize = 10 }: PaginationQuery) {
        const queryOptions: QueryOptions<Cart> = {};
        if (typeof page !== 'number') {
            page = Number(page);
            queryOptions.skip = (page - 1) * pageSize;
        }

        if (typeof pageSize !== 'number') {
            pageSize = Number(pageSize);
            queryOptions.limit = pageSize;
        }

        if (isTrueSet(no_limit)) {
            queryOptions.limit = undefined;
            queryOptions.skip = undefined;
        }

        return { no_limit, page, pageSize };
    }
}
