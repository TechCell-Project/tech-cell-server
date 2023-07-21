import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.ultil.service';
import { CreateProductRequestDto, ChangeStatusDTO, UpdateProductRequestDto } from './dtos';
import { Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

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

    async getProductById(id: string | Types.ObjectId | any) {
        try {
            const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            return await this.productsService.getProduct({ _id: idSearch }, {});
        } catch (error) {
            throw new RpcException(new BadRequestException('Product Id is invalid'));
        }
    }

    async changeStatus({ productId, status }: ChangeStatusDTO) {
        const [changeRole] = await Promise.all([
            this.productsService.findOneAndUpdateProduct({ _id: productId }, { status: status }),
            this.delCacheProducts(),
        ]);

        return changeRole;
    }
}
