import { ConflictException, Injectable } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.util.service';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    async createProduct({ ...payload }: CreateProductRequestDTO) {
        const productToCreate = this.updateProductWithSku(payload);

        const isProductExist = await this.isProductExist(productToCreate);
        if (isProductExist) {
            throw new RpcException(
                new ConflictException(`Product '${isProductExist}' is already exist`),
            );
        }

        await this.validProductAttributes(productToCreate);

        return await this.productsService.createProduct(productToCreate);
    }

    // async getProductById(id: string | Types.ObjectId | any) {
    //     try {
    //         const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    //         return await this.productsService.getProduct({ _id: idSearch }, {});
    //     } catch (error) {
    //         throw new RpcException(new BadRequestException('Product Id is invalid'));
    //     }
    // }

    // async changeStatus({ productId, status }: ChangeStatusDTO) {
    //     const [changeRole] = await Promise.all([
    //         this.productsService.findOneAndUpdateProduct({ _id: productId }, { status: status }),
    //         this.delCacheProducts(),
    //     ]);

    //     return changeRole;
    // }
}
