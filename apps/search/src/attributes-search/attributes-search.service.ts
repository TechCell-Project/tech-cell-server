import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';
import { GetAttributesDTO } from './dtos';

@Injectable()
export class AttributesSearchService {
    constructor(
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
    ) {}

    async getAttributes({ all = false, limit = 1, offset = 0 }: GetAttributesDTO) {
        const options = { limit, skip: offset };

        // const cacheKey = 'attributes';
        // const attributesFromCache = await this.cacheManager.get(cacheKey);
        // if (attributesFromCache) {
        //     return attributesFromCache;
        // }

        if (all) {
            delete options.limit;
            delete options.skip;
        }
        const attributesFromDb = await this.attributesService.getAttributes({
            queryArgs: { ...options },
        });

        // await this.cacheManager.set(cacheKey, attributesFromDb);

        return attributesFromDb;
    }

    async getAttributeById(attributeId: string) {
        return await this.attributesService.getAttributeById(attributeId);
    }
}
