import { AttributesService, CategoriesService, Product, ProductsService } from '@app/resource';
import { Inject, Injectable } from '@nestjs/common';
import { delStartWith } from '@app/common/utils';
import {
    REDIS_CACHE,
    PRODUCTS_CACHE_PREFIX,
    PRODUCTS_ALL,
    PRODUCTS_PAGESIZE,
    PRODUCTS_PAGE,
} from '~/constants';
import { Store } from 'cache-manager';

@Injectable()
export class ProductsSearchUtilService {
    constructor(
        protected readonly productsService: ProductsService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        protected readonly attributesService: AttributesService,
        protected readonly categoriesService: CategoriesService,
    ) {}

    protected buildCacheKeyProducts({
        page,
        pageSize,
        all,
    }: {
        page?: number;
        pageSize?: number;
        all?: boolean;
    }) {
        const arrCacheKey = [];

        if (all) {
            return PRODUCTS_ALL;
        }

        if (page) {
            arrCacheKey.push(`${PRODUCTS_PAGE}_${page}`);
        }

        if (pageSize) {
            arrCacheKey.push(`${PRODUCTS_PAGESIZE}_${pageSize}`);
        }

        return arrCacheKey.join('_');
    }

    /**
     *
     * @returns remove all products cache
     */
    protected async delCacheProducts() {
        return await delStartWith(PRODUCTS_CACHE_PREFIX, this.cacheManager);
    }

    protected async assignDetailToProductLists(productsFromDb: Product[]) {
        productsFromDb = await this.assignAttributesToProductLists(productsFromDb);
        productsFromDb = await this.assignCategoriesToProducts(productsFromDb);

        return productsFromDb;
    }

    private async assignAttributesToProductLists(productsFromDb: Product[]) {
        const attributesSet = new Set(
            ...productsFromDb.map((product) => {
                const { generalAttributes, variations: varAttributes } = product;
                const attributes = [...generalAttributes.map((attr) => attr.k)];
                varAttributes.forEach((variation) => {
                    attributes.push(...variation.attributes.map((attr) => attr.k));
                });
                return attributes;
            }),
        );
        const att = await Promise.all(
            Array.from(attributesSet).map((attr) =>
                this.attributesService.getAttributeByLabel(attr),
            ),
        );

        productsFromDb.forEach((product) => {
            const { generalAttributes, variations: varAttributes } = product;
            generalAttributes.forEach((attr) => {
                const attribute = att.find((a) => a.label === attr.k);
                if (attribute) {
                    Object.assign(attr, {
                        name: attribute.name,
                        description: attribute.description,
                    });
                }
            });
            varAttributes.forEach((variation) => {
                variation.attributes.forEach((attr) => {
                    const attribute = att.find((a) => a.label === attr.k);
                    if (attribute) {
                        Object.assign(attr, {
                            name: attribute.name,
                            description: attribute.description,
                        });
                    }
                });
            });
        });
        return productsFromDb;
    }

    private async assignCategoriesToProducts(productsFromDb: Product[]) {
        // const categoriesSet = new Set(
        //     ...productsFromDb.map((product) => {
        //         return product.categories;
        //     }),
        // );
        // const categories = await Promise.all(
        //     Array.from(categoriesSet).map((category) =>
        //         this.categoriesService.getCategory({
        //             filterQueries: {
        //                 label: category,
        //             },
        //         }),
        //     ),
        // );

        // productsFromDb.forEach((product) => {
        //     const { categories } = product;
        //     categories.forEach((category) => {
        //         const categoryInfo = categories.find((c) => c === category);
        //         if (categoryInfo) {
        //             Object.assign(category, {
        //                 name: categoryInfo.name,
        //                 description: categoryInfo.description,
        //             });
        //         }
        //     });
        // }

        return productsFromDb;
    }

    protected async assignDetailToProduct(product: Product) {
        product = await this.assignAttributesToProduct(product);

        return product;
    }

    private async assignAttributesToProduct(product: Product) {
        const { generalAttributes, variations: varAttributes } = product;
        const attributes = [...generalAttributes.map((attr) => attr.k)];
        varAttributes.forEach((variation) => {
            attributes.push(...variation.attributes.map((attr) => attr.k));
        });

        const attributesSet = new Set(attributes);

        const att = await Promise.all(
            Array.from(attributesSet).map((attr) =>
                this.attributesService.getAttributeByLabel(attr),
            ),
        );

        product.generalAttributes.forEach((attr) => {
            const attribute = att.find((a) => a.label === attr.k);
            if (attribute) {
                Object.assign(attr, {
                    name: attribute.name,
                    description: attribute.description,
                });
            }
        });
        product.variations.forEach((variation) => {
            variation.attributes.forEach((attr) => {
                const attribute = att.find((a) => a.label === attr.k);
                if (attribute) {
                    Object.assign(attr, {
                        name: attribute.name,
                        description: attribute.description,
                    });
                }
            });
        });

        return product;
    }
}
