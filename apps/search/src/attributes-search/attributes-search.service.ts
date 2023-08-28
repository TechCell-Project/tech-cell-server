import { Attribute, AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';
import { GetAttributesRequestDTO } from './dtos';
import { SelectType } from './enums';
import { FilterQuery, QueryOptions } from 'mongoose';
import { ListDataResponseDTO } from '@app/common/dtos';

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
        const attributeArgs: FilterQuery<Attribute> = {};
        const options: QueryOptions<Attribute> = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: Number(pageSize) || 10,
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

        if (typeof no_limit === 'string') {
            no_limit = no_limit === 'true';
        }

        if (no_limit) {
            delete options.skip;
            delete options.limit;
        }

        const [attributesFromDb, totalRecord] = await Promise.all([
            this.attributesService.getAttributes({
                filterQueries: { ...attributeArgs },
                queryOptions: { ...options },
            }),
            this.attributesService.countAttributes({ ...attributeArgs }),
        ]);

        // await this.cacheManager.set(cacheKey, attributesFromDb);

        return new ListDataResponseDTO({
            data: attributesFromDb,
            page: no_limit ? 1 : page,
            pageSize: no_limit ? totalRecord : pageSize,
            totalPage: no_limit ? 1 : Math.ceil(totalRecord / pageSize),
            totalRecord,
        });
    }

    async getAttributeById(attributeId: string) {
        return await this.attributesService.getAttributeById(attributeId);
    }

    async getAttributeByLabel(label: string) {
        return await this.attributesService.getAttributeByLabel(label);
    }
}
