import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';
import { GetAttributesRequestDTO } from './dtos';
import { SelectType } from './enums';

@Injectable()
export class AttributesSearchService {
    constructor(
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
    ) {}

    async getAttributes({
        no_limit = false,
        page = 1,
        pageSize = 10,
        select_type = SelectType.onlyActive,
    }: GetAttributesRequestDTO) {
        const attributeArgs = {};
        const options = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize ? pageSize : 10,
        };

        // const cacheKey = 'attributes';
        // const attributesFromCache = await this.cacheManager.get(cacheKey);
        // if (attributesFromCache) {
        //     return attributesFromCache;
        // }

        switch (select_type) {
            case SelectType.onlyActive:
                Object.assign(attributeArgs, {
                    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
                });
                break;
            case SelectType.onlyDeleted:
                Object.assign(attributeArgs, { isDelete: true });
                break;
            case SelectType.both:
                delete attributeArgs['isDeleted'];
                break;
        }

        if (no_limit) {
            delete options.skip;
            delete options.limit;
        }

        const attributesFromDb = await this.attributesService.getAttributes({
            filterQueries: { ...attributeArgs },
            queryOptions: { ...options },
        });

        // await this.cacheManager.set(cacheKey, attributesFromDb);

        return attributesFromDb;
    }

    async getAttributeById(attributeId: string) {
        return await this.attributesService.getAttributeById(attributeId);
    }

    async getAttributeByLabel(label: string) {
        return await this.attributesService.getAttributeByLabel(label);
    }
}
