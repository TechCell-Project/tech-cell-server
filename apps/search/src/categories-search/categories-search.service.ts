import { CategoriesService } from '@app/resource/categories';
import { Injectable } from '@nestjs/common';
import { GetCategoriesRequestDTO } from './dtos';

@Injectable()
export class CategoriesSearchService {
    constructor(private readonly categoriesService: CategoriesService) {}

    // async createCategory(data: any) {
    //     return await this.categoriesService.createCategory(data);
    // }

    // async getCategory() {
    //     return await this.categoriesService.getCategory();
    // }

    async getCategories({ page, pageSize }: GetCategoriesRequestDTO) {
        /**
         * @default page = 1
         * @default pageSize = 10
         */
        const queryOptions = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize ? pageSize : 10,
        };
        return await this.categoriesService.getCategories({ queryOptions });
    }
}
