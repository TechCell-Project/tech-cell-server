import { CategoriesService } from '@app/resource/categories';
import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~libs/common/constants';

@Injectable()
export class CategoriesMntUtilService {
    constructor(
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

    public readonly MUST_HAVE_ATTRIBUTES = ['height', 'weight', 'length', 'width'];

    protected async validateCategoryRequireAttributes(requireAttributes: string[]) {
        const requireAttributesArray = Array.from(
            new Set([...requireAttributes, ...this.MUST_HAVE_ATTRIBUTES]),
        );
        return await Promise.all(
            requireAttributesArray.map(async (attributeLabel) => {
                const attribute = await this.attributesService.getAttributeByLabel(attributeLabel);
                delete attribute['_id'];
                delete attribute['createdAt'];
                delete attribute['updatedAt'];
                return attribute;
            }),
        );
    }

    /**
     *
     * @param attributes array of attributes to be sorted
     * @returns array of sorted attributes by label following ascending order alphabetically
     */
    protected sortAttributes(attributes: any[]) {
        return attributes.sort((a, b) => {
            return a.label > b.label ? 1 : -1;
        });
    }
}
