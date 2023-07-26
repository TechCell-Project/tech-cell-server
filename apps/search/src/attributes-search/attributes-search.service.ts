import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';
import { GetAttributesRequestDTO } from './dtos';
import { SelectDelete } from './enums';

@Injectable()
export class AttributesSearchService {
    constructor(
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
    ) {}

    async getAttributes({
        all = false,
        limit = 1,
        offset = 0,
        selectDelete = SelectDelete.onlyActive,
    }: GetAttributesRequestDTO) {
        const attributeArgs = {};
        const options = { limit, skip: offset };

        // const cacheKey = 'attributes';
        // const attributesFromCache = await this.cacheManager.get(cacheKey);
        // if (attributesFromCache) {
        //     return attributesFromCache;
        // }

        switch (selectDelete) {
            case SelectDelete.onlyActive:
                Object.assign(attributeArgs, {
                    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
                });
                break;
            case SelectDelete.onlyDeleted:
                Object.assign(attributeArgs, { isDelete: true });
                break;
            case SelectDelete.both:
                delete attributeArgs['isDelete'];
                break;
        }

        if (all) {
            delete options.limit;
            delete options.skip;
        }
        const attributesFromDb = await this.attributesService.getAttributes({
            getAttributesArgs: { ...attributeArgs },
            queryArgs: { ...options },
        });

        // await this.cacheManager.set(cacheKey, attributesFromDb);

        return attributesFromDb;
    }

    async getAttributeById(attributeId: string) {
        return await this.attributesService.getAttributeById(attributeId);
    }
}
