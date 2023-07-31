import { CategoriesService } from '@app/resource/categories';
import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';
import { CreateCategoryRequestDTO } from './dtos';

@Injectable()
export class CategoriesMntService {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
    ) {}

    async createCategory({
        label,
        name,
        description,
        url,
        requireAttributes,
    }: CreateCategoryRequestDTO) {
        let listAttribute = [];

        if (requireAttributes) {
            listAttribute = await Promise.all(
                requireAttributes.map(async (attributeLabel) => {
                    const attribute = await this.attributesService.getAttributeByLabel(
                        attributeLabel,
                    );
                    delete attribute['_id'];
                    delete attribute['createdAt'];
                    delete attribute['updatedAt'];
                    return attribute;
                }),
            );
        }

        return await this.categoriesService.createCategory({
            label,
            name,
            description,
            url,
            requireAttributes: listAttribute,
        });
    }

    // async updateAttribute({ attributeId, description, name }: UpdateAttributeDTO) {
    //     return await this.CategoriesService.updateAttribute({ attributeId, name, description });
    // }

    // async deleteAttribute(attributeId: string) {
    //     return await this.CategoriesService.deleteAttribute(attributeId);
    // }
}
