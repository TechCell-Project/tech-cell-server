import { Injectable } from '@nestjs/common';
import { IBaseQuery } from '@app/resource/interfaces';
import { CreateCategoryDTO } from './dtos';
import { CategoriesRepository } from './categories.repository';
import { Category } from './schemas';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async createCategory({ ...categoryData }: CreateCategoryDTO) {
        const category = await this.categoriesRepository.create({ ...categoryData });
        return category;
    }

    async getCategory({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Category>) {
        const category = await this.categoriesRepository.findOne(
            filterQueries,
            queryOptions,
            projectionArgs,
        );
        return category;
    }

    async getCategories() {
        const categories = await this.categoriesRepository.find({});
        return categories;
    }
}
