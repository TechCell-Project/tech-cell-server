import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.util.service';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDTO } from '@app/resource';
import { compareTwoObjectAndGetDifferent, validateDTO } from '@app/common';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { Types } from 'mongoose';

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

    async updateProductGeneral({
        productId,
        ...productUpdatedData
    }: UpdateProductRequestDTO & { productId: Types.ObjectId }) {
        if (!productUpdatedData) {
            throw new RpcException(new BadRequestException(`No data to updated`));
        }

        const oldProduct = await this.productsService.getProduct({
            filterQueries: {
                _id: productId,
            },
        });

        const diff: any = compareTwoObjectAndGetDifferent(oldProduct, productUpdatedData, [
            'generalImages',
            'variations',
            'updatedAt',
            'createdAt',
            '__v',
            '_id',
        ]);

        // Check if there is any data to update
        if (Object.keys(diff).length === 0) {
            throw new RpcException(new BadRequestException(`No data to updated`));
        }

        // Check if there is any new field added to product
        if (Object.values(diff).some((value: any) => value?.kind === 'N')) {
            throw new RpcException(new BadRequestException(`Can not add new field to product`));
        }

        const productUpdated = await this.productsService.updateProductById(
            oldProduct._id,
            Object.assign(oldProduct, new UpdateProductRequestDTO(productUpdatedData)),
        );

        return { ...productUpdated };
    }

    async gen(num: number) {
        try {
            const list = await this.productsService.getProducts();
            const one = list[list.length - 1];
            delete one._id;
            Object.assign(one, {
                createdAt: undefined,
                updatedAt: undefined,
            });
            delete one.__v;
            const products = [];
            for (let i = 0; i < num; i++) {
                products.push({ ...one, name: `${one.name} ${i}` });
            }
            await Promise.all(
                products.map((product) => this.productsService.createProduct(product)),
            );
            return {
                message: `Generated ${num} products`,
            };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(new BadRequestException(error.message));
        }
    }
}
