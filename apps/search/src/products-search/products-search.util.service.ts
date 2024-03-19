import {
    AttributesService,
    CategoriesService,
    Product,
    ProductsService,
    UsersService,
} from '~libs/resource';
import { Injectable } from '@nestjs/common';
import {
    PRODUCTS_CACHE_PREFIX,
    PRODUCTS_ALL,
    PRODUCTS_PAGESIZE,
    PRODUCTS_PAGE,
} from '~libs/common/constants';
import { RedisService } from '~libs/common/Redis/services';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated';

@Injectable()
export class ProductsSearchUtilService {
    constructor(
        protected readonly productsService: ProductsService,
        protected redisService: RedisService,
        protected readonly attributesService: AttributesService,
        protected readonly categoriesService: CategoriesService,
        protected readonly usersService: UsersService,
        @I18n() protected readonly i18nService: I18nService<I18nTranslations>,
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
        return await this.redisService.delWithPrefix(PRODUCTS_CACHE_PREFIX);
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
