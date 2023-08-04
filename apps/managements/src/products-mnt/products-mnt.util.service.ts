import {
    AttributesService,
    CategoriesService,
    CreateProductDTO,
    ProductsService,
} from '@app/resource';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { delStartWith, replaceWhitespaceTo } from '@app/common/utils';
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
            generalImagesToUpload.map(({ file }) => this.cloudinaryService.uploadFile(file)),
        );

        // Upload variation images
        const variationImagesUploaded = await Promise.all(
            variationImagesToUpload.map((files) =>
                Promise.all(files.map(({ file }) => this.cloudinaryService.uploadFile(file))),
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
        const { brand, name, variations } = productData;

        const newProduct: CreateProductDTO = {
            ...productData,
            generalImages: [],
            variations: variations.map((variation) => {
                const { attributes } = variation;
                const sortedAttributes = attributes.sort((a, b) => a.k.localeCompare(b.k));

                const sku = `${replaceWhitespaceTo(brand)}-${replaceWhitespaceTo(
                    name,
                )}-${sortedAttributes
                    .map((attribute) => replaceWhitespaceTo(attribute.v))
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
     * @param product product data when create
     * @returns true if all attributes are valid, otherwise throw error
     */
    protected async validProductAttributes(product: CreateProductRequestDTO) {
        const {
            categories: categoryLabels = [],
            variations = [],
            generalAttributes = [],
        } = product;

        // Find all categories to get require attributes each category
        const foundCategories = await Promise.all(
            categoryLabels.map((label) =>
                this.categoriesService.getCategory({ filterQueries: { label } }),
            ),
        );

        // Must to have attributes
        const requireAttributes = foundCategories.flatMap((category) =>
            category.requireAttributes.map((attribute) => attribute.label),
        );

        // All attributes in user import
        const allAttributesUserImport = [
            ...variations.flatMap((variation) =>
                variation.attributes.map((attribute) => attribute.k),
            ),
            ...generalAttributes.map((attribute) => attribute.k),
        ];

        // Check if all required attributes exist in user import
        const missingAttributes = requireAttributes.filter(
            (attribute) => !allAttributesUserImport.includes(attribute),
        );

        // Throw error if missing required attributes
        if (missingAttributes.length > 0) {
            throw new RpcException(
                new BadRequestException(
                    `Missing required attributes: ${missingAttributes.join(', ')}`,
                ),
            );
        }

        // All added attributes in user import
        const addedAttributes = allAttributesUserImport.filter(
            (attribute) => !requireAttributes.includes(attribute),
        );

        // Check if all added attributes exist in attributes
        await Promise.all(
            addedAttributes.map((label) => this.attributesService.getAttributeByLabel(label)),
        );

        return true;
    }
}
