import { Injectable, Logger } from '@nestjs/common';
import { PRODUCTS_ALL } from '~/constants';
// import { Types } from 'mongoose';
// import { RpcException } from '@nestjs/microservices';
import { ProductsMntUtilService } from './products-mnt.ultil.service';
import { timeStringToMs } from '@app/common';
import { CreateProductRequestDto } from './dto';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    async getAllProducts() {
        const cacheKey = PRODUCTS_ALL;
        const productsFromCache = await this.cacheManager.get(cacheKey);
        if (productsFromCache) {
            Logger.log(`CACHE HIT: ${cacheKey}`);
            return productsFromCache;
        }

        Logger.warn(`CACHE MISS: ${cacheKey}`);
        const productsFromDb = await this.productsService.getAllProducts();

        await this.cacheManager.set(cacheKey, productsFromDb, timeStringToMs('1h'));

        return productsFromDb;
    }

    async createProduct(payload: CreateProductRequestDto) {
        const {
            name,
            attributes,
            manufacturer,
            images,
            categories,
            stock,
            filter,
            price,
            special_price,
            thumbnail,
            status,
        } = payload;
        return await this.productsService.createProduct({
            name,
            attributes,
            manufacturer,
            images,
            categories,
            stock,
            filter,
            price,
            special_price,
            thumbnail,
            status,
        });
    }

    async changeStatus({ productId, status }: { productId: string; status: number }) {
        const [changeRole] = await Promise.all([
            this.productsService.findOneAndUpdateProduct({ _id: productId }, { status: status }),
            this.delCacheProducts(),
        ]);

        return changeRole;
    }
}
