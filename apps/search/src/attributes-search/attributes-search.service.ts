import { Attribute, AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~libs/common/constants';
import { GetAttributesRequestDTO } from './dtos';
import { SelectType } from './enums';
import { FilterQuery, QueryOptions } from 'mongoose';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { generateRegexQuery } from 'regex-vietnamese';

@Injectable()
export class AttributesSearchService {
    constructor(
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
    ) {}

    async getAttributes({
        page = 1,
        pageSize = 10,
        select_type = SelectType.onlyActive,
        keyword = undefined,
    }: GetAttributesRequestDTO) {
        const filter: FilterQuery<Attribute> = {};
        const options: QueryOptions<Attribute> = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: Number(pageSize) || 10,
        };

        switch (select_type) {
            case SelectType.onlyActive:
                Object.assign(filter, {
                    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
                });
                break;
            case SelectType.onlyDeleted:
                Object.assign(filter, { isDelete: true });
                break;
            case SelectType.both:
                delete filter['isDeleted'];
                break;
        }

        if (keyword) {
            const keywordRegex = generateRegexQuery(keyword);
            Object.assign(filter, {
                $or: [
                    { name: keywordRegex },
                    { label: keywordRegex },
                    { description: keywordRegex },
                ],
            });
        }

        const [attributesFromDb, totalRecord] = await Promise.all([
            this.attributesService.getAttributes({
                filterQueries: { ...filter },
                queryOptions: { ...options },
            }),
            this.attributesService.countAttributes({ ...filter }),
        ]);

        return new ListDataResponseDTO({
            data: attributesFromDb,
            page: page,
            pageSize: pageSize,
            totalPage: Math.ceil(totalRecord / pageSize),
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
