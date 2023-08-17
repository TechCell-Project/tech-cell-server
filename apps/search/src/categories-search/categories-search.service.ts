import { CategoriesService, Category } from '@app/resource/categories';
import { Injectable } from '@nestjs/common';
import { GetCategoriesRequestDTO } from './dtos';
import { QueryOptions } from 'mongoose';
import { ListDataResponseDTO } from '@app/common/dtos';

@Injectable()
export class CategoriesSearchService {
    constructor(private readonly categoriesService: CategoriesService) {}

    // async createCategory(data: any) {
    //     return await this.categoriesService.createCategory(data);
    // }

    // async getCategory() {
    //     return await this.categoriesService.getCategory();
    // }

    async getCategories({ page = 1, pageSize = 10 }: GetCategoriesRequestDTO) {
        /**
         * @default page = 1
         * @default pageSize = 10
         */
        if (typeof page !== 'number') {
            page = Number(page);
        }
        if (typeof pageSize !== 'number') {
            pageSize = Number(pageSize);
        }

        const queryOptions: QueryOptions<Category> = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize || 10,
        };

        const [dataFromDb, totalRecord] = await Promise.all([
            this.categoriesService.getCategories({ queryOptions }),
            this.categoriesService.countCategories(),
        ]);
        const totalPage = Math.ceil(totalRecord / pageSize);

        return new ListDataResponseDTO({
            page,
            pageSize,
            totalPage,
            totalRecord,
            data: dataFromDb,
        });
    }

    async getCategoryByLabel(label: string) {
        return await this.categoriesService.getCategory({ filterQueries: { label } });
    }
}
