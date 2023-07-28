import { CategoriesService } from '@app/resource/categories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesSearchService {
    constructor(private readonly categoriesService: CategoriesService) {}

    // async createCategory(data: any) {
    //     return await this.categoriesService.createCategory(data);
    // }

    // async getCategory() {
    //     return await this.categoriesService.getCategory();
    // }

    async getCategories() {
        return await this.categoriesService.getCategories();
    }
}
