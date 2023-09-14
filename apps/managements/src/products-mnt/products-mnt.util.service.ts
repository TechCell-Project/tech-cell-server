import {
    AttributesService,
    CategoriesService,
    CreateProductDTO,
    ImageDTO,
    Product,
    ProductsService,
} from '@app/resource';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import {
    allowToAction,
    compareTwoObjectAndGetDifferent,
    delStartWith,
    findDuplicates,
    replaceWhitespaceTo,
} from '@app/common/utils';
import { REDIS_CACHE, PRODUCTS_CACHE_PREFIX } from '~/constants';
import { Store } from 'cache-manager';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CloudinaryService } from '@app/common/Cloudinary';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';

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

    protected async resolveImages({ productData }: { productData: CreateProductRequestDTO }) {
        const { generalImages = [], descriptionImages = [], variations = [] } = productData;
        const imagesId = new Set(
            [
                ...generalImages.map((i) => i?.publicId),
                ...descriptionImages.map((i) => i?.publicId),
                ...variations.flatMap((variation) => variation?.images?.map((i) => i?.publicId)),
            ].filter((publicId) => !!publicId),
        );

        let newGeneralImages: ImageDTO[] = [];
        let newDescriptionImages: ImageDTO[] = [];
        let newVar = [];

        if (imagesId.size === 0) {
            return {
                generalImages: newGeneralImages,
                descriptionImages: newDescriptionImages,
                variations: newVar,
            };
        }

        const invalidImages: string[] = [];
        const validAll = await Promise.all(
            Array.from(imagesId).map(async (publicId) => {
                try {
                    return await this.cloudinaryService.getImageByPublicId(publicId);
                } catch (error) {
                    invalidImages.push(publicId);
                }
            }),
        );

        if (invalidImages.length > 0) {
            throw new RpcException(
                new BadRequestException(
                    `Images with publicIds '${invalidImages.join(', ')}' not found`,
                ),
            );
        }

        newGeneralImages = generalImages?.map((image) => {
            const validImage = validAll.find((valid) => valid.public_id === image.publicId);
            return new ImageDTO({
                publicId: validImage?.public_id,
                url: validImage?.secure_url,
                isThumbnail: image.isThumbnail,
            });
        });

        newDescriptionImages = descriptionImages?.map((image) => {
            const validImage = validAll.find((valid) => valid.public_id === image.publicId);
            return new ImageDTO({
                publicId: validImage?.public_id,
                url: validImage?.secure_url,
                isThumbnail: image.isThumbnail,
            });
        });

        newVar = variations?.map((variation) => {
            const { images } = variation;
            const validImages = images?.map((image) => {
                const validImage = validAll.find((valid) => valid.public_id === image.publicId);
                return new ImageDTO({
                    publicId: validImage?.public_id,
                    url: validImage?.secure_url,
                    isThumbnail: image.isThumbnail,
                });
            });
            return { ...variation, images: validImages };
        });

        return {
            generalImages: newGeneralImages,
            descriptionImages: newDescriptionImages,
            variations: newVar,
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
    protected async validProductAttributes(product: CreateProductRequestDTO | CreateProductDTO) {
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
            descriptionImages: [],
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

        // Check if sku is duplicated
        const duplicateSkus = [...findDuplicates(newProduct.variations.map((v) => v.sku))];
        if (duplicateSkus.length > 0) {
            throw new RpcException(
                new BadRequestException(`Duplicate skus: ${duplicateSkus.join(', ')}`),
            );
        }

        return newProduct;
    }

    protected allowFieldsToUpdateProduct(
        oldProduct: Product,
        productUpdatedData: UpdateProductRequestDTO,
    ) {
        // get diff between old product and new product
        const diff = compareTwoObjectAndGetDifferent(oldProduct, productUpdatedData, {
            type: 'omit',
            omitKey: [
                '_id',
                'createdAt',
                'updatedAt',
                '__v',
                'generalImages.#.url',
                'descriptionImages.#.url',
                'variations.#.images.#.url',
            ],
        });

        const isAllow = allowToAction(diff, [
            {
                kind: 'N', // new
                paths: ['generalImages', 'descriptionImages', 'variations.#.images'],
            },
            {
                kind: 'E', // edit
                paths: [
                    'description',
                    'status',
                    'generalImages.#.publicId',
                    'generalImages.#.isThumbnail',
                    'descriptionImages.#.publicId',
                    'descriptionImages.#.isThumbnail',
                    'variations.#.stock',
                    'variations.#.images.#.publicId',
                    'variations.#.images.#.isThumbnail',
                ],
            },
            {
                kind: 'A', // array
                paths: [
                    'generalAttributes',
                    'generalImages',
                    'descriptionImages',
                    'variations.#.images',
                    'variations',
                ],
            },
        ]);

        return isAllow;
    }
}
