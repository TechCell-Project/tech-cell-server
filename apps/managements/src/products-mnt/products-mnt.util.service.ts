import {
    Attribute,
    AttributesService,
    CategoriesService,
    CreateProductDTO,
    ImageDTO,
    Product,
    ProductsService,
    VariationDTO,
} from '~libs/resource';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
    allowToAction,
    compareTwoObjectAndGetDifferent,
    findDuplicates,
    replaceWhitespaceTo,
} from '~libs/common/utils';
import { PRODUCTS_CACHE_PREFIX } from '~libs/common/constants';
import { AttributeDTO, CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { ProductStatus } from '~libs/resource/products/enums';
import { RedisService } from '~libs/common/Redis/services';

@Injectable()
export class ProductsMntUtilService {
    protected readonly logger = new Logger(ProductsMntUtilService.name);

    constructor(
        protected readonly productsService: ProductsService,
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        protected redisService: RedisService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    /**
     * Find images by publicId and return the object of image
     * @param param0 Product data when create
     * @returns the data of images after resolve
     */
    protected async resolveImages({
        generalImages = [],
        descriptionImages = [],
        variations = [],
    }: Partial<CreateProductRequestDTO>) {
        const imagesId = new Set(
            [
                ...generalImages.map((i) => i?.publicId),
                ...descriptionImages.map((i) => i?.publicId),
                ...variations.flatMap((variation) => variation?.images?.map((i) => i?.publicId)),
            ].filter((publicId) => !!publicId),
        );

        let newGeneralImages: ImageDTO[] = [];
        let newDescriptionImages: ImageDTO[] = [];
        let newVariations: VariationDTO[] = [];

        if (imagesId.size === 0) {
            return {
                generalImages: newGeneralImages,
                descriptionImages: newDescriptionImages,
                variations: newVariations,
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

        newVariations = variations?.map((variation) => {
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
            variations: newVariations,
        };
    }

    /**
     *
     * @param param0 variation data when create
     * @returns if product exist, return the sku of variation, else return false
     */
    protected async isProductExist({ variations }: Partial<CreateProductRequestDTO>) {
        try {
            const foundProduct = await this.productsService.getProduct({
                filterQueries: {
                    variations: {
                        $elemMatch: {
                            sku: {
                                $in: variations.map((variation) => variation.sku),
                            },
                        },
                    },
                },
            });

            if (foundProduct) {
                const foundVariation = foundProduct.variations.find((variation) =>
                    variations.some((pVariation) => pVariation.sku === variation.sku),
                );

                return foundVariation?.sku || false;
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     *
     * @returns remove all products cache
     */
    protected async delCacheProducts() {
        return this.redisService.delWithPrefix(PRODUCTS_CACHE_PREFIX);
    }

    /**
     * Validates the attributes of a product.
     * @param product The product to validate.
     * @returns `true` if the validation succeeds.
     * @throws `BadRequestException` if the validation fails.
     */
    protected async validProductAttributes(product: Partial<CreateProductRequestDTO>) {
        const { category, variations, generalAttributes } = product;
        const foundCategories = await this.categoriesService.getCategory({
            filterQueries: {
                _id: category,
            },
        });

        const requireAttributes = [
            ...new Set(foundCategories.requireAttributes.map((attribute) => attribute.label)),
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
            ...variations.map((variation: VariationDTO) =>
                variation.attributes.map((attribute: AttributeDTO) => attribute.k),
            ),
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

        let allAttributesFromDb: Attribute[] = [];
        try {
            [...allAttributesFromDb] = await Promise.all(
                allAttributesUserImport.map((label: string) =>
                    this.attributesService.getAttributeByLabel(label),
                ),
            );
        } catch (error) {
            throw new RpcException(new BadRequestException(error.message));
        }

        // Reassign attributes with name
        product.generalAttributes = generalAttributes.map((attribute) => {
            const foundAttribute = allAttributesFromDb.find((a) => a.label === attribute.k);
            return {
                ...attribute,
                name: foundAttribute.name,
            };
        });
        product.variations = variations.map((variation) => {
            const attributes = variation.attributes.map((attribute) => {
                const foundAttribute = allAttributesFromDb.find((a) => a.label === attribute.k);
                return {
                    ...attribute,
                    name: foundAttribute.name,
                };
            });
            return { ...variation, attributes };
        });

        return product;
    }

    /**
     * Sort attributes by key and build sku for each variation
     * @param productData the product data when create
     * @returns the product data with sku in each variation
     */
    protected updateSkuVariations({
        name,
        variations,
    }: Partial<CreateProductRequestDTO>): Partial<CreateProductDTO> {
        const variationsNew = variations.map((variation) => {
            const { attributes } = variation;
            const sortedAttributes = attributes.slice().sort((a, b) => a.k.localeCompare(b.k));

            // Base on variation's attributes to generate sku
            const sku = `${replaceWhitespaceTo(name)}-${sortedAttributes
                .map(({ k, v, u }) => {
                    const attributeValue = `${replaceWhitespaceTo(k)}.${replaceWhitespaceTo(v)}`;
                    return u ? `${attributeValue}.${replaceWhitespaceTo(u)}` : attributeValue;
                })
                .join('-')}`.toLowerCase();

            return {
                ...variation,
                attributes: sortedAttributes,
                sku,
                images: [],
                status: variation.status ? variation.status : ProductStatus.Hide, // default status is hide
            };
        });

        // Check if sku is duplicated
        const duplicateSkus = [...findDuplicates(variationsNew.map((v) => v.sku))];
        if (duplicateSkus.length > 0) {
            throw new RpcException(
                new BadRequestException(`Duplicate skus: ${duplicateSkus.join(', ')}`),
            );
        }

        return { variations: variationsNew };
    }

    /**
     *
     * @param oldProduct left hand side is old product
     * @param productUpdatedData right hand side is new product
     * @returns if allow to update, return true, otherwise return array of error message
     */
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
                'variations.#.sku',
                'variations.#.status',
            ],
        });

        const isAllow = allowToAction(diff, [
            {
                kind: 'N', // new
                paths: [
                    'generalImages',
                    'descriptionImages',
                    'variations.#.images',
                    'generalAttributes.#.k',
                    'generalAttributes.#.v',
                    'generalAttributes.#.u',
                    'variations.#.attributes.#.u',
                ],
            },
            {
                kind: 'E', // edit
                paths: [
                    'description',
                    'status',
                    'generalAttributes',
                    'descriptionImages',
                    'generalAttributes.#.k',
                    'generalAttributes.#.v',
                    'generalAttributes.#.u',
                    'generalImages.#.publicId',
                    'generalImages.#.isThumbnail',
                    'descriptionImages.#.publicId',
                    'descriptionImages.#.isThumbnail',
                    'variations.#.images',
                    'variations.#.images.#.publicId',
                    'variations.#.images.#.isThumbnail',
                    'variations.#.stock',
                ],
            },
            {
                kind: 'A', // allow change in array
                paths: [
                    'generalAttributes',
                    'generalImages',
                    'descriptionImages',
                    'variations.#.images',
                    'variations',
                ],
            },
            {
                kind: 'D', // delete
                paths: ['generalAttributes.#.k', 'generalAttributes.#.v', 'generalAttributes.#.u'],
            },
        ]);

        return isAllow;
    }
}
