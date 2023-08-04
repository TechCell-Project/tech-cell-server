import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProductsSearchUtilService } from './products-search.util.service';
import { QueryProductParamsDTO } from './dtos';
import { timeStringToMs } from '@app/common';
import { Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsSearchService extends ProductsSearchUtilService {
    async getProducts(payload: QueryProductParamsDTO) {
        const { all, limit = 1, offset = 0 } = payload;

        // const query: GetProductsDTO = {};
        const options = { limit, skip: offset };

        const cacheKey = this.buildCacheKeyProducts({ limit, offset, all });
        const productsFromCache = await this.cacheManager.get(cacheKey);
        if (productsFromCache) {
            Logger.log(`CACHE HIT: ${cacheKey}`);
            return productsFromCache;
        }

        if (all) {
            delete options.limit;
            delete options.skip;
        }

        Logger.warn(`CACHE MISS: ${cacheKey}`);
        const productsFromDb = await this.productsService
            .getProducts
            // {
            //     /*...query*/
            //     // TODO: limit, offset is not a part of `product`
            // },
            // { ...options },
            ();

        await this.cacheManager.set(cacheKey, productsFromDb, timeStringToMs('1h'));

        return productsFromDb;
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
