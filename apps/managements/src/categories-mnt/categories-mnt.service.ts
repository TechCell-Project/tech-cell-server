import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO } from './dtos';
import { CategoriesMntUtilService } from './categories-mnt.util.service';
import { convertToObjectId } from '~libs/common/utils';

export class CategoriesMntService extends CategoriesMntUtilService {
    async createCategory({
        label,
        name,
        description,
        url,
        requireAttributes,
    }: CreateCategoryRequestDTO) {
        let listAttribute = [];

        if (requireAttributes) {
            listAttribute = await this.validateCategoryRequireAttributes(requireAttributes);
            listAttribute = this.sortAttributes(listAttribute);
        }

        return await this.categoriesService.createCategory({
            label,
            name,
            description,
            url,
            requireAttributes: listAttribute,
        });
    }

    async updateCategory({
        categoryId,
        ...updateData
    }: UpdateCategoryRequestDTO & { categoryId: string }) {
        const newCategory = { ...updateData, requireAttributes: [] };

        if (updateData.requireAttributes) {
            newCategory.requireAttributes = await this.validateCategoryRequireAttributes(
                updateData.requireAttributes,
            );
            newCategory.requireAttributes = this.sortAttributes(newCategory.requireAttributes);
        }

        return await this.categoriesService.updateCategory({
            filterQueries: { _id: convertToObjectId(categoryId) },
            updateData: { ...newCategory },
        });
    }

    // async deleteAttribute(attributeId: string) {
    //     return await this.CategoriesService.deleteAttribute(attributeId);
    // }
}
