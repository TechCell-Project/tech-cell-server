import {
    AttributesService,
    CategoriesService,
    CreateProductDTO,
    ProductsService,
} from '@app/resource';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { delStartWith, replaceWhitespaceTo } from '@app/common/utils';
import { REDIS_CACHE, PRODUCTS_CACHE_PREFIX } from '~/constants';
import { Store } from 'cache-manager';
import { CreateProductRequestDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsMntUtilService {
    constructor(
        protected readonly productsService: ProductsService,
        protected readonly categoriesService: CategoriesService,
        protected readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
    ) {}

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
            variations: variations.map((variation) => {
                const { attributes } = variation;
                const sortedAttributes = attributes.sort((a, b) => a.k.localeCompare(b.k));

                const sku = `${replaceWhitespaceTo(brand)}-${replaceWhitespaceTo(
                    name,
                )}-${sortedAttributes
                    .map((attribute) => replaceWhitespaceTo(attribute.v))
                    .join('-')}`.toLowerCase();

                return { ...variation, attributes: sortedAttributes, sku };
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
