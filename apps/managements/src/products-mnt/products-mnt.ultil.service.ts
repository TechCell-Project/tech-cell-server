import { CreateProductDTO, ProductsService } from '@app/resource';
import { Inject, Injectable } from '@nestjs/common';
import { delStartWith, replaceWhitespaceTo } from '@app/common/utils';
import { REDIS_CACHE, PRODUCTS_CACHE_PREFIX } from '~/constants';
import { Store } from 'cache-manager';
import { CreateProductRequestDTO } from './dtos';

@Injectable()
export class ProductsMntUtilService {
    constructor(
        protected readonly productsService: ProductsService,
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
}
