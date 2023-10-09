import { CategoriesService, Category, CategoryIdParam } from '@app/resource/categories';
import { Injectable } from '@nestjs/common';
import { GetCategoriesRequestDTO } from './dtos';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { ListDataResponseDTO } from '@app/common/dtos';
import { generateRegexQuery } from 'regex-vietnamese';

@Injectable()
export class CategoriesSearchService {
    constructor(private readonly categoriesService: CategoriesService) {}

    async getCategories({ page = 1, pageSize = 10, keyword = undefined }: GetCategoriesRequestDTO) {
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

        let filterQueries: FilterQuery<Category> = {};
        if (keyword) {
            const keywordRegex = generateRegexQuery(keyword);
            filterQueries = {
                $or: [
                    { name: keywordRegex },
                    { label: keywordRegex },
                    { description: keywordRegex },
                ],
            };
        }

        const [dataFromDb, totalRecord] = await Promise.all([
            this.categoriesService.getCategories({ filterQueries, queryOptions }),
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

    async getCategoryById({ categoryId }: CategoryIdParam) {
        return await this.categoriesService.getCategory({
            filterQueries: { _id: new Types.ObjectId(categoryId) },
        });
    }
}
