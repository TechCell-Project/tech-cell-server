import { ProductsService } from '@app/resource';
import { Inject, Injectable } from '@nestjs/common';
import { delStartWith } from '@app/common/utils';
import {
    REDIS_CACHE,
    PRODUCTS_CACHE_PREFIX,
    PRODUCTS_ALL,
    PRODUCTS_PAGESIZE,
    PRODUCTS_PAGE,
} from '~/constants';
import { Store } from 'cache-manager';

@Injectable()
export class ProductsSearchUtilService {
    constructor(
        protected readonly productsService: ProductsService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

    protected buildCacheKeyProducts({
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
            return PRODUCTS_ALL;
        }

        if (page) {
            arrCacheKey.push(`${PRODUCTS_PAGE}_${page}`);
        }

        if (pageSize) {
            arrCacheKey.push(`${PRODUCTS_PAGESIZE}_${pageSize}`);
        }

        return arrCacheKey.join('_');
    }

    /**
     *
     * @returns remove all products cache
     */
    protected async delCacheProducts() {
        return await delStartWith(PRODUCTS_CACHE_PREFIX, this.cacheManager);
    }
}
