import { Injectable } from '@nestjs/common';
import { ProductsSearchUtilService } from './products-search.util.service';
import { GetProductByIdQueryDTO, GetProductsDTO } from './dtos';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { Product } from '@app/resource';
import { ListDataResponseDTO } from '@app/common/dtos';
import { generateSearchQuery, isTrueSet } from '@app/common';

@Injectable()
export class ProductsSearchService extends ProductsSearchUtilService {
    async getProducts(queryData: GetProductsDTO) {
        const searchQuery = new GetProductsDTO(queryData);
        const { page, pageSize, detail } = searchQuery;

        const filterOpt: FilterQuery<Product> = {};
        if (searchQuery.keyword) {
            const keywordRegex = generateSearchQuery(searchQuery.keyword);
            Object.assign(filterOpt, {
                $or: [
                    { name: keywordRegex },
                    { description: keywordRegex },
                    { categories: keywordRegex },
                    {
                        'variations.k': keywordRegex,
                    },
                    {
                        'variations.v': keywordRegex,
                    },
                    {
                        'variations.u': keywordRegex,
                    },
                ],
            });
        }

        const queryOpt: QueryOptions<Product> = {
            lean: false,
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize > 500 ? 500 : pageSize,
        };

        const [productsFromDb, totalRecord] = await Promise.all([
            this.productsService.getProducts({
                filterQueries: filterOpt,
                queryOptions: queryOpt,
                selectType: searchQuery.select_type,
            }),
            this.productsService.countProducts(filterOpt),
        ]);

        const totalPage = Math.ceil(totalRecord / pageSize);

        return new ListDataResponseDTO({
            data: detail ? await this.assignDetailToProductLists(productsFromDb) : productsFromDb,
            page,
            pageSize: pageSize,
            totalPage: totalPage,
            totalRecord,
        });
    }

    async getProductById({
        id,
        ...query
    }: { id: string | Types.ObjectId } & GetProductByIdQueryDTO) {
        const resultFromDb = await this.productsService.getProduct({
            filterQueries: { _id: id },
            queryOptions: { lean: false },
        });
        let prodReturn = resultFromDb;

        if (isTrueSet(query.detail)) {
            prodReturn = await this.assignDetailToProduct(resultFromDb);
        }

        return prodReturn;
    }
}
