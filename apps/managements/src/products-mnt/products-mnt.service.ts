import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.util.service';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDTO } from '@app/resource';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { ProductIdParamsDTO } from './dtos/params.dto';
import { Types } from 'mongoose';
import { sanitizeHtmlString } from '@app/common/utils';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    async createProduct({ ...productData }: CreateProductRequestDTO) {
        // Validate the attributes of product
        // Check if the attributes is valid or not
        // Check if the attributes is exits in db or not
        // If not, throw the exception
        // If pass return the new version that attributes have been sorted
        productData = await this.validProductAttributes({ ...productData });
        productData.description = sanitizeHtmlString(productData.description);

        // Base on variation's attributes to generate sku
        const productToCreate: CreateProductDTO = this.updateProductWithSku(productData);

        // Check if product is already exist or not with the same sku
        const isProductExist = await this.isProductExist(productToCreate);
        if (isProductExist) {
            throw new RpcException(
                new ConflictException(`Product '${isProductExist}' is already exist`),
            );
        }

        // Resolve images to add the url to image object
        // Because user just post the `publicId` of image
        const { generalImages, descriptionImages, variations } = await this.resolveImages({
            productData: productData,
        });
        // Assign `generalImages` product
        if (generalImages.length > 0) {
            productToCreate.generalImages = generalImages;
        } else {
            delete productToCreate?.generalImages;
        }

        // Assign `descriptionImages` product
        if (descriptionImages.length > 0) {
            productToCreate.descriptionImages = descriptionImages;
        } else {
            delete productToCreate?.descriptionImages;
        }

        // Assign `variations` product, merge with the old one
        // The `productToCreate.variations` is old one, it update the sku
        // The `variations` is new one, it updated the image object with more data
        // Merge two object to get the new one
        for (let i = 0; i < productToCreate.variations.length; i++) {
            if (variations[i]?.images.length > 0) {
                productToCreate.variations[i].images = variations[i].images;
            } else {
                delete productToCreate.variations[i]?.images;
            }
        }

        return await this.productsService.createProduct(productToCreate);
    }

    async updateProductPutMethod({
        productId,
        ...productUpdatedData
    }: ProductIdParamsDTO & UpdateProductRequestDTO) {
        try {
            productId = new Types.ObjectId(productId);
        } catch (error) {
            throw new RpcException(new BadRequestException('Invalid product id'));
        }

        // Find product by id to check if it is exist or not
        // If not, throw the exception
        const oldProduct = await this.productsService.getProduct({
            filterQueries: {
                _id: productId,
            },
        });

        const isAllow = this.allowFieldsToUpdateProduct(oldProduct, productUpdatedData);
        if (isAllow !== true) {
            throw new RpcException(new BadRequestException(isAllow));
        }

        // Resolve add new variations
        // If the variation is already exist, throw the exception
        // If not, add the new one
        // If pass return the new version that attributes have been sorted
        productUpdatedData = await this.validProductAttributes({ ...productUpdatedData });
        // Base on variation's attributes to generate sku
        productUpdatedData = this.updateProductWithSku(productUpdatedData);

        // Resolve images to add the url to image object
        // Because user just post the `publicId` of image
        const { generalImages, descriptionImages, variations } = await this.resolveImages({
            productData: productUpdatedData,
        });

        // Assign `generalImages` product
        if (generalImages.length > 0) {
            productUpdatedData.generalImages = generalImages;
        } else {
            delete productUpdatedData?.generalImages;
        }

        // Assign `descriptionImages` product
        if (descriptionImages.length > 0) {
            productUpdatedData.descriptionImages = descriptionImages;
        } else {
            delete productUpdatedData?.descriptionImages;
        }

        // Assign `variations` product, merge with the old one
        // The `productUpdatedData.variations` is old one, it update the sku
        // The `variations` is new one, it updated the image object with more data
        // Merge two object to get the new one
        for (let i = 0; i < productUpdatedData.variations.length; i++) {
            if (variations[i]?.images.length > 0) {
                productUpdatedData.variations[i].images = variations[i].images;
            } else {
                delete productUpdatedData.variations[i]?.images;
            }
        }

        return await this.productsService.updateProductById(productId, {
            $set: {
                ...productUpdatedData,
                updatedAt: new Date(),
            },
        });
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
