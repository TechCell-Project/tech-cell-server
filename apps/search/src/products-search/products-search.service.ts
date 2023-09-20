import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsSearchUtilService } from './products-search.util.service';
import { GetProductByIdQueryDTO, GetProductsDTO } from './dtos';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Product } from '@app/resource';
import { ListDataResponseDTO } from '@app/common/dtos';
import { isTrueSet } from '@app/common';

@Injectable()
export class ProductsSearchService extends ProductsSearchUtilService {
    async getProducts({
        page = 1,
        pageSize = 10,
        detail = false,
        keyword = undefined,
    }: GetProductsDTO) {
        try {
            if (typeof page !== 'number') {
                page = Number(page);
            }

            if (typeof pageSize !== 'number') {
                pageSize = Number(pageSize);
            }
        } catch (error) {
            throw new RpcException(new BadRequestException('Page and page size must be a number'));
        }

        let filterOpt: FilterQuery<Product> = {};
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            filterOpt = {
                $or: [
                    { name: regex },
                    { description: regex },
                    { categories: regex },
                    {
                        'variations.k': regex,
                    },
                    {
                        'variations.v': regex,
                    },
                    {
                        'variations.u': regex,
                    },
                ],
            };
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
            }),
            this.productsService.countProducts(),
        ]);
        const totalPage = Math.ceil(totalRecord / pageSize);

        return new ListDataResponseDTO({
            data: isTrueSet(detail)
                ? await this.assignDetailToProductLists(productsFromDb)
                : productsFromDb,
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
