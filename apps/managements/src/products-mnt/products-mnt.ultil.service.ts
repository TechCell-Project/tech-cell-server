import { ProductsService } from '@app/resource';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CACHE, PRODUCTS_ALL, PRODUCTS_OFFSET, PRODUCTS_LIMIT } from '~/constants';
import { Store } from 'cache-manager';

@Injectable()
export class ProductsMntUtilService {
    constructor(
        protected readonly productsService: ProductsService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

    protected buildCacheKeyProducts({
        limit,
        offset,
        all,
    }: {
        limit?: number;
        offset?: number;
        all?: boolean;
    }) {
        const arrCacheKey = [];

        if (all) {
            return PRODUCTS_ALL;
        }

        if (limit) {
            arrCacheKey.push(`${PRODUCTS_LIMIT}_${limit}`);
        }

        if (offset) {
            arrCacheKey.push(`${PRODUCTS_OFFSET}_${offset}`);
        }

        return arrCacheKey.join('_');
    }
}
