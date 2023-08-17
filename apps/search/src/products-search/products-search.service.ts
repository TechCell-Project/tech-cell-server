import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsSearchUtilService } from './products-search.util.service';
import { QueryProductParamsDTO } from './dtos';
import { QueryOptions, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Product } from '@app/resource';
import { ListDataResponseDTO } from '@app/common/dtos';

@Injectable()
export class ProductsSearchService extends ProductsSearchUtilService {
    async getProducts({ page = 1, pageSize = 10, ...payload }: QueryProductParamsDTO) {
        const { all } = payload;

        if (typeof page !== 'number') {
            page = Number(page);
        }

        if (typeof pageSize !== 'number') {
            pageSize = Number(pageSize);
        }

        const options: QueryOptions<Product> = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize || 10,
        };

        // const cacheKey = this.buildCacheKeyProducts({ page, pageSize, all });
        // const productsFromCache = await this.cacheManager.get(cacheKey);
        // if (productsFromCache) {
        //     Logger.log(`CACHE HIT: ${cacheKey}`);
        //     return productsFromCache;
        // }

        if (all) {
            delete options.limit;
            delete options.skip;
        }

        // Logger.warn(`CACHE MISS: ${cacheKey}`);

        const [productsFromDb, totalRecord] = await Promise.all([
            this.productsService.getProducts(),
            this.productsService.countProducts(),
        ]);
        const totalPage = Math.ceil(totalRecord / pageSize);

        // await this.cacheManager.set(cacheKey, productsFromDb, timeStringToMs('1h'));

        return new ListDataResponseDTO({
            data: productsFromDb,
            page,
            pageSize: all ? totalRecord : pageSize,
            totalPage: all ? 1 : totalPage,
            totalRecord,
        });
    }

    async getProductById(id: string) {
        try {
            const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            return await this.productsService.getProduct({ filterQueries: { _id: idSearch } });
        } catch (error) {
            throw new RpcException(new BadRequestException('Product Id is invalid'));
        }
    }

    // async getProductById(id: string | Types.ObjectId | any) {
    //     try {
    //         const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    //         return await this.productsService.getProduct({ _id: idSearch }, {});
    //     } catch (error) {
    //         throw new RpcException(new BadRequestException('Product Id is invalid'));
    //     }
    // }
}
