import { CategoriesService } from '~libs/resource/categories';
import { AttributesService } from '~libs/resource/attributes';
import { Injectable } from '@nestjs/common';
import { RedisService } from '~libs/common/Redis/services';

@Injectable()
export class CategoriesMntUtilService {
    constructor(
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        private redisService: RedisService,
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
