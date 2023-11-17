import { ConflictException, Injectable } from '@nestjs/common';
import { IBaseQuery } from '~libs/resource/interfaces';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dtos';
import { CategoriesRepository } from './categories.repository';
import { Category } from './schemas';
import { RpcException } from '@nestjs/microservices';
import { FilterQuery } from 'mongoose';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async createCategory({ name, label, description, url, requireAttributes }: CreateCategoryDTO) {
        const isDuplicateLabel = await this.isExistCategory({ filterQueries: { label } });
        if (isDuplicateLabel) {
            throw new RpcException(new ConflictException("Category's label is already exist"));
        }
        return await this.categoriesRepository.create({
            name,
            label,
            description,
            url,
            requireAttributes,
        });
    }

    async getCategory({ filterQueries, queryOptions, projectionArgs }: IBaseQuery<Category>) {
        const category = await this.categoriesRepository.findOne(
            filterQueries,
            queryOptions,
            projectionArgs,
        );
        return category;
    }

    async getCategories({
        filterQueries,
        queryOptions,
        projectionArgs,
    }: IBaseQuery<Partial<Category>>): Promise<Category[] | undefined> {
        return this.categoriesRepository.find({
            filterQuery: filterQueries,
            queryOptions: queryOptions,
            projection: projectionArgs,
        });
    }

    async updateCategory({
        filterQueries,
        updateData,
    }: IBaseQuery<Category> & { updateData: UpdateCategoryDTO }) {
        return await this.categoriesRepository.findOneAndUpdate(filterQueries, updateData);
    }

    async isExistCategory({ filterQueries }: IBaseQuery<Category>) {
        try {
            const category = await this.categoriesRepository.findOne(filterQueries);
            console.log(category);
            return category ? true : false;
        } catch (error) {
            return false;
        }
    }

    async countCategories(filterQueries: FilterQuery<Category> = {}) {
        return await this.categoriesRepository.count(filterQueries);
    }
}
