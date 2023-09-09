import {
    AttributesService,
    CategoriesService,
    CreateProductDTO,
    ProductsService,
} from '@app/resource';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { delStartWith, findDuplicates, replaceWhitespaceTo } from '@app/common/utils';
import { REDIS_CACHE, PRODUCTS_CACHE_PREFIX, ProductImageFieldname } from '~/constants';
import { Store } from 'cache-manager';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CloudinaryService } from '@app/common/Cloudinary';
import { ImageSchema } from '@app/resource/products/schemas';

@Injectable()
export class ProductsMntUtilService {
    protected readonly logger = new Logger(ProductsMntUtilService.name);

    constructor(
        protected readonly productsService: ProductsService,
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    protected async resolveImages({
        productData,
        files,
    }: {
        productData: CreateProductDTO;
        files: Express.Multer.File[];
    }) {
        const { variations } = productData;

        // Define images to upload of general
        const generalImagesToUpload: Array<{ file: Express.Multer.File; isThumbnail: boolean }> =
            [];

        // Define images to upload of variation
        const variationImagesToUpload: Array<
            Array<{ file: Express.Multer.File; isThumbnail: boolean }>
        > = [];

        // Resolve images
        files.forEach((file) => {
            // Replace whitespace to underscore, and lowercase fieldname
            file.fieldname = file.fieldname.trim();
            file.fieldname = replaceWhitespaceTo(file.fieldname, '_');
            file.fieldname = file.fieldname.toLowerCase();

            // Validate fieldname if has both general and variation
            if (
                file.fieldname.includes(ProductImageFieldname.GENERAL) &&
                file.fieldname.includes(ProductImageFieldname.VARIATION)
            ) {
                throw new RpcException(
                    new BadRequestException(
                        `Image fieldname must be start with '${ProductImageFieldname.GENERAL}' or '${ProductImageFieldname.VARIATION}'`,
                    ),
                );
            }

            if (file.fieldname.includes(ProductImageFieldname.GENERAL)) {
                generalImagesToUpload.push({
                    file,
                    isThumbnail: file.fieldname.includes(ProductImageFieldname.IS_THUMBNAIL),
                });
            }

            if (file.fieldname.includes(ProductImageFieldname.VARIATION)) {
                const index =
                    parseInt(file.fieldname.split('_')[file.fieldname.split('_').length - 1]) - 1;
                if (!variationImagesToUpload[index]) {
                    variationImagesToUpload[index] = [];
                }

                variationImagesToUpload[index].push({
                    file,
                    isThumbnail: file.fieldname.includes(ProductImageFieldname.IS_THUMBNAIL),
                });
            }
        });

        // Upload general images
        const generalImagesUploaded = await Promise.all(
            generalImagesToUpload.map(({ file }) => this.cloudinaryService.uploadImage(file)),
        );

        // Upload variation images
        const variationImagesUploaded = await Promise.all(
            variationImagesToUpload.map((files) =>
                Promise.all(files.map(({ file }) => this.cloudinaryService.uploadImage(file))),
            ),
        );

        // Map general images
        const generalImages: Array<ImageSchema> = generalImagesUploaded.flatMap((image) => {
            return {
                url: image.secure_url,
                publicId: image.public_id,
            };
        });

        // Map variation images
        const newVariations = variations.map((variation, index) => {
            const variationImages: Array<ImageSchema> =
                variationImagesUploaded[index]?.flatMap((image) => {
                    return {
                        url: image.secure_url,
                        publicId: image.public_id,
                    };
                }) || [];
            return {
                ...variation,
                images: [...(variation.images || []), ...variationImages],
            };
        });

        // Set thumbnail for general images
        generalImagesToUpload.forEach((image, index) => {
            if (image.isThumbnail) {
                generalImages[index].isThumbnail = true;
            }
        });

        // Set thumbnail for variation images
        variationImagesToUpload.forEach((variationImages, variationIndex) => {
            variationImages.forEach((image, index) => {
                if (image.isThumbnail) {
                    newVariations[variationIndex].images[index].isThumbnail = true;
                }
            });
        });

        return {
            generalImages: [...generalImages],
            variations: newVariations,
        };
    }

    protected async isProductExist(product: CreateProductDTO) {
        try {
            const foundProduct = await this.productsService.getProduct({
                filterQueries: {
                    variations: {
                        $elemMatch: {
                            sku: {
                                $in: product.variations.map((variation) => variation.sku),
                            },
                        },
                    },
                },
            });

            if (foundProduct) {
                const foundVariation = foundProduct.variations.find((variation) =>
                    product.variations.some((pVariation) => pVariation.sku === variation.sku),
                );

                return foundVariation?.sku || false;
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Sort attributes by key and build sku for each variation
     * @param productData the product data when create
     * @returns the product data with sku in each variation
     */
    protected updateProductWithSku(productData: CreateProductRequestDTO): CreateProductDTO {
        const { name, variations } = productData;

        const newProduct: CreateProductDTO = {
            ...productData,
            generalImages: [],
            variations: variations.map((variation) => {
                const { attributes } = variation;
                const sortedAttributes = attributes.slice().sort((a, b) => a.k.localeCompare(b.k));

                const sku = `${replaceWhitespaceTo(name)}-${sortedAttributes
                    .map(({ k, v, u }) => {
                        const attributeValue = `${replaceWhitespaceTo(k)}.${replaceWhitespaceTo(
                            v,
                        )}`;
                        return u ? `${attributeValue}.${replaceWhitespaceTo(u)}` : attributeValue;
                    })
                    .join('-')}`.toLowerCase();

                return { ...variation, attributes: sortedAttributes, sku, images: [] };
            }),
        };

        return newProduct;
    }

    // protected buildCacheKeyProducts({
    //     limit,
    //     offset,
    //     all,
    // }: {
    //     limit?: number;
    //     offset?: number;
    //     all?: boolean;
    // }) {
    //     const arrCacheKey = [];

    //     if (all) {
    //         return PRODUCTS_ALL;
    //     }

    //     if (limit) {
    //         arrCacheKey.push(`${PRODUCTS_LIMIT}_${limit}`);
    //     }

    //     if (offset) {
    //         arrCacheKey.push(`${PRODUCTS_OFFSET}_${offset}`);
    //     }

    //     return arrCacheKey.join('_');
    // }

    /**
     *
     * @returns remove all products cache
     */
    protected async delCacheProducts() {
        return await delStartWith(PRODUCTS_CACHE_PREFIX, this.cacheManager);
    }

    /**
     * Validates the attributes of a product.
     * @param product The product to validate.
     * @returns `true` if the validation succeeds.
     * @throws `BadRequestException` if the validation fails.
     */
    protected async validProductAttributes(product: CreateProductRequestDTO) {
        const {
            categories: categoryLabels = [],
            variations = [],
            generalAttributes = [],
        } = product;

        // Reassign the lowercase attribute keys to the original product object, remove u if null or undefined
        product.variations = variations.map((variation) => ({
            ...variation,
            attributes: variation.attributes.map((attribute) => ({
                k: attribute.k.toLowerCase(), // lowercase attribute key
                v: attribute.v,
                ...(attribute.u != null && attribute.u != undefined ? { u: attribute.u } : {}), // remove unit if null
            })),
        }));
        product.generalAttributes = generalAttributes.map((attribute) => ({
            k: attribute.k.toLowerCase(), // lowercase attribute key
            v: attribute.v,
            ...(attribute.u != null && attribute.u != undefined ? { u: attribute.u } : {}), // remove unit if null
        }));

        const foundCategories = await Promise.all(
            categoryLabels.map((label) =>
                this.categoriesService.getCategory({ filterQueries: { label } }),
            ),
        );

        const requireAttributes = [
            ...new Set(
                foundCategories.flatMap((category) =>
                    category.requireAttributes.map((attribute) => attribute.label),
                ),
            ),
        ];

        // Checking duplicate attributes in one variation
        for (const [index, variation] of variations.entries()) {
            const duplicateAttributes = [...findDuplicates(variation.attributes.map((a) => a.k))];
            if (duplicateAttributes.length > 0) {
                throw new RpcException(
                    new BadRequestException(
                        `Duplicate attributes in variation ${index}: ${duplicateAttributes.join(
                            ', ',
                        )}`,
                    ),
                );
            }
        }

        // After pass the duplicate attributes check, we can get all attributes in all variations as a set
        const variationAttributesUserImport = new Set(
            ...variations.map((variation) => variation.attributes.map((attribute) => attribute.k)),
        );
        const generalAttributesUserImport = generalAttributes.map((attribute) => attribute.k);

        // All attributes in all variations and general
        const allAttributesUserImport = [
            ...variationAttributesUserImport,
            ...generalAttributesUserImport,
        ];

        // Checking duplicate attributes in all variations with general
        const duplicateAttributes = [...findDuplicates(allAttributesUserImport)];
        if (duplicateAttributes.length > 0) {
            throw new RpcException(
                new BadRequestException(`Duplicate attributes: ${duplicateAttributes.join(', ')}`),
            );
        }

        // Checking missing attributes in all variations and general
        const missingAttributes = requireAttributes.filter(
            (attribute) => !allAttributesUserImport.includes(attribute),
        );
        if (missingAttributes.length > 0) {
            throw new RpcException(
                new BadRequestException(
                    `Missing required attributes: ${missingAttributes.join(', ')}`,
                ),
            );
        }

        try {
            await Promise.all(
                allAttributesUserImport.map((label) =>
                    this.attributesService.getAttributeByLabel(label),
                ),
            );
        } catch (error) {
            throw new RpcException(new BadRequestException(error.message));
        }

        return product;
    }
}
