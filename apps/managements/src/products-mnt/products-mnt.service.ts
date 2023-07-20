import { Injectable } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.ultil.service';
import { CreateProductRequestDto, ChangeStatusDTO } from './dtos';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
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

    async changeStatus({ productId, status }: ChangeStatusDTO) {
        const [changeRole] = await Promise.all([
            this.productsService.findOneAndUpdateProduct({ _id: productId }, { status: status }),
            this.delCacheProducts(),
        ]);

        return changeRole;
    }
}
