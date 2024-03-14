import { Injectable } from '@nestjs/common';
import { ProductsSearchUtilService } from './products-search.util.service';
import { GetProductByIdQueryDTO, GetProductsDTO } from './dtos';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { Product } from '~libs/resource';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { convertToObjectId, isTrueSet } from '~libs/common/utils/shared.util';
import { generateRegexQuery } from 'regex-vietnamese';
import { TCurrentUser } from '~libs/common/types';
import { SelectType } from '../enums';
import { IBaseQuery } from '~libs/resource/interfaces';
import { SelectTypeDTO } from '../dtos/select-type.dto';

@Injectable()
export class ProductsSearchService extends ProductsSearchUtilService {
    async getProducts(queryData: GetProductsDTO) {
        const searchQuery = new GetProductsDTO(queryData);
        const { page, pageSize, detail } = searchQuery;

        const filterOpt: FilterQuery<Product> = {};
        if (searchQuery.keyword) {
            const keywordRegex = generateRegexQuery(searchQuery.keyword);
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
        user,
        ...query
    }: { id: string | Types.ObjectId } & GetProductByIdQueryDTO & { user?: TCurrentUser }) {
        const optionObject: IBaseQuery<Product> & SelectTypeDTO = {
            filterQueries: { _id: convertToObjectId(id) },
            queryOptions: { lean: false },
        };

        if (user && (await this.usersService.isStaffOrManager(user._id))) {
            optionObject.selectType = SelectType.both;
        }

        if (query.select_type) {
            optionObject.selectType = query.select_type;
        }

        const resultFromDb = await this.productsService.getProduct(optionObject);
        let prodReturn = resultFromDb;

        if (isTrueSet(query.detail)) {
            prodReturn = await this.assignDetailToProduct(resultFromDb);
        }

        return prodReturn;
    }
}
