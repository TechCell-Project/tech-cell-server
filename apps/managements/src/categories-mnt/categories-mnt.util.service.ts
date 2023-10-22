import { CategoriesService } from '@app/resource/categories';
import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '@app/common/constants';

@Injectable()
export class CategoriesMntUtilService {
    constructor(
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

    protected async validateCategoryRequireAttributes(requireAttributes: string[]) {
        return await Promise.all(
            requireAttributes.map(async (attributeLabel) => {
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
