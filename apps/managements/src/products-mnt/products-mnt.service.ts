import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { ProductsMntUtilService } from './products-mnt.util.service';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDTO } from '~libs/resource';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { ProductIdParamsDTO, ProductSkuQueryDTO } from './dtos/params.dto';
import { ProductStatus } from '~libs/resource/products/enums';
import { convertToObjectId } from '~libs/common';

@Injectable()
export class ProductsMntService extends ProductsMntUtilService {
    async createProduct(data: CreateProductRequestDTO) {
        const productData = new CreateProductRequestDTO(data);

        // Need to reassign image
        // Because the image object in `productData` is not the same object with the image object in `CreateProductDTO`
        const productToCreate = new CreateProductDTO(productData);

        // Validate the attributes of product
        // Check if the attributes is valid or not
        // Check if the attributes is exits in db or not
        // If not, throw the exception
        // If pass return the new version that attributes have been sorted
        const {
            generalAttributes: generalAttrValidated,
            variations: variationsAttributeValidated,
        } = await this.validProductAttributes(productData);
        productData.variations = variationsAttributeValidated;
        const { variations: variationSku } = this.updateSkuVariations(productData);

        // Assign the attributes to product
        productToCreate.generalAttributes = generalAttrValidated;
        // Reassign the sku for variation
        productToCreate.variations = variationSku;

        // Check if product is already exist or not with the same sku
        const isProductExist = await this.isProductExist({
            variations: productToCreate.variations,
        });
        if (isProductExist) {
            throw new RpcException(
                new ConflictException(`Product '${isProductExist}' is already exist`),
            );
        }

        /* REASSIGN IMAGE */
        // Resolve images to add the url to image object
        // Because user just post the `publicId` of image
        const { generalImages, descriptionImages, variations } =
            await this.resolveImages(productData);

        // Assign `generalImages` product
        if (generalImages?.length > 0) {
            productToCreate.generalImages = generalImages;
        } else {
            delete productToCreate.generalImages;
        }

        // Assign `descriptionImages` product
        if (descriptionImages?.length > 0) {
            productToCreate.descriptionImages = descriptionImages;
        } else {
            delete productToCreate.descriptionImages;
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
        /* REASSIGN IMAGE END */

        return await this.productsService.createProduct(productToCreate);
    }

    async updateProductPutMethod({
        productId,
        ...newData
    }: ProductIdParamsDTO & UpdateProductRequestDTO) {
        try {
            productId = convertToObjectId(productId);
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    this.i18n.t('errorMessage.PROPERTY_ID_INVALID', {
                        args: {
                            property: 'product',
                        },
                    }),
                ),
            );
        }

        // Find product by id to check if it is exist or not
        // If not, throw the exception
        const oldProduct = await this.productsService.getProduct({
            filterQueries: {
                _id: convertToObjectId(productId),
            },
        });

        const productUpdatedData = new UpdateProductRequestDTO(newData);

        const isAllow = this.allowFieldsToUpdateProduct(oldProduct, productUpdatedData);
        if (isAllow !== true) {
            throw new RpcException(new BadRequestException(isAllow));
        }

        // Resolve images to add the url to image object
        // Because user just post the `publicId` of image
        const { generalImages, descriptionImages, variations } =
            await this.resolveImages(productUpdatedData);

        // Resolve add new variations
        // If the variation is already exist, throw the exception
        // If not, add the new one
        // If pass return the new version that attributes have been sorted
        const { variations: variationValidated, generalAttributes: generalAttrValidated } =
            await this.validProductAttributes(productUpdatedData);
        productUpdatedData.generalAttributes = generalAttrValidated;
        productUpdatedData.variations = variationValidated;

        // Base on variation's attributes to generate sku
        productUpdatedData.variations = this.updateSkuVariations(productUpdatedData).variations;

        // Assign `generalImages` product
        if (generalImages?.length > 0) {
            productUpdatedData.generalImages = generalImages;
        } else {
            productUpdatedData.generalImages = [];
        }

        // Assign `descriptionImages` product
        if (descriptionImages?.length > 0) {
            productUpdatedData.descriptionImages = descriptionImages;
        } else {
            productUpdatedData.descriptionImages = [];
        }

        // Assign `variations` product, merge with the old one
        // The `productUpdatedData.variations` is old one, it update the sku
        // The `variations` is new one, it updated the image object with more data
        // Merge two object to get the new one
        for (let i = 0; i < productUpdatedData.variations.length; i++) {
            if (variations[i]?.images?.length > 0) {
                productUpdatedData.variations[i].images = variations[i].images;
            } else {
                productUpdatedData.variations[i].images = [];
            }
        }

        return await this.productsService.updateProductById(productId, productUpdatedData);
    }

    async gen(num: number) {
        try {
            const list = await this.productsService.getProducts({});
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

    async deleteProduct({ productId }: ProductIdParamsDTO) {
        try {
            productId = convertToObjectId(productId);
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    this.i18n.t('errorMessage.PROPERTY_ID_INVALID', {
                        args: {
                            property: 'product',
                        },
                    }),
                ),
            );
        }

        // Find product by id to check if it is exist or not
        // If not, throw the exception
        const product = await this.productsService.getProduct({
            filterQueries: {
                _id: convertToObjectId(productId),
            },
        });

        return await this.productsService.deleteProductById(product._id);
    }

    async deleteProductVariation({ productId, sku }: ProductIdParamsDTO & ProductSkuQueryDTO) {
        try {
            productId = convertToObjectId(productId);
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    this.i18n.t('errorMessage.PROPERTY_ID_INVALID', {
                        args: {
                            property: 'product',
                        },
                    }),
                ),
            );
        }

        // Find product by id to check if it is exist or not
        // If not, throw the exception
        const product = await this.productsService.getProduct({
            filterQueries: {
                _id: convertToObjectId(productId),
                variations: {
                    $elemMatch: {
                        sku: sku,
                    },
                },
            },
        });

        // Find the variation by sku to check if it is exist or not
        // If not, throw the exception
        product.variations.forEach((variation) => {
            if (variation.sku === sku) {
                variation.status = ProductStatus.Deleted;
            }
        });

        return await this.productsService.updateProductById(product._id, product);
    }
}
