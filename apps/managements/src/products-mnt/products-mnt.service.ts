import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.util.service';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDTO } from '@app/resource';
import { validateDTO } from '@app/common';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    async createProduct({
        productData,
        files,
    }: {
        productData: string;
        files: Express.Multer.File[];
    }) {
        if (!productData) {
            throw new RpcException(new BadRequestException(`productData is required`));
        }

        const productParse = JSON.parse(productData) as CreateProductRequestDTO;
        await validateDTO(productParse, CreateProductRequestDTO);

        await this.validProductAttributes({ ...productParse });
        const productToCreate: CreateProductDTO = this.updateProductWithSku(productParse);

        const isProductExist = await this.isProductExist(productToCreate);
        if (isProductExist) {
            throw new RpcException(
                new ConflictException(`Product '${isProductExist}' is already exist`),
            );
        }

        const { generalImages, variations } = await this.resolveImages({
            productData: productToCreate,
            files,
        });

        productToCreate.generalImages = generalImages;
        productToCreate.variations = variations;

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
