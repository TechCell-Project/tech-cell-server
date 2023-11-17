import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ } from '@nestjs/microservices';
import { ProductsController } from '../products.controller';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { ProductsMntMessagePattern } from '~apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~apps/search/products-search';
import { GetProductByIdQueryDTO, GetProductsDTO } from '~apps/search/products-search/dtos';
import {
    CreateProductRequestDTO,
    UpdateProductRequestDTO,
    ProductIdParamsDTO,
    ProductSkuParamsDTO,
} from '~apps/managements/products-mnt/dtos';
import { Types } from 'mongoose';

describe(ProductsController, () => {
    let productsController: ProductsController;
    let managementsService: jest.Mocked<ClientRMQ>;
    let searchService: jest.Mocked<ClientRMQ>;

    beforeAll(async () => {
        const mockUsing = {
            send: jest.fn().mockImplementation(() => ({
                pipe: jest.fn().mockImplementation(() => of({})),
            })),
        };
        const { unit, unitRef } = TestBed.create(ProductsController)
            .mock<ClientRMQ>(MANAGEMENTS_SERVICE)
            .using(mockUsing)
            .mock<ClientRMQ>(SEARCH_SERVICE)
            .using(mockUsing)
            .compile();

        productsController = unit;
        managementsService = unitRef.get<ClientRMQ>(MANAGEMENTS_SERVICE);
        searchService = unitRef.get<ClientRMQ>(SEARCH_SERVICE);
    });

    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test('should be defined', () => {
        expect(productsController).toBeDefined();
        expect(managementsService).toBeDefined();
        expect(searchService).toBeDefined();
    });

    describe('getProducts', () => {
        const message = ProductsSearchMessagePattern.getProducts;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: GetProductsDTO = {
                page: 1,
                pageSize: 10,
            };
            await productsController.getProducts(data);
            expect(searchService.send).toBeCalledWith(message, data);
        });
    });

    describe('getProductById', () => {
        const message = ProductsSearchMessagePattern.getProductById;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const params: ProductIdParamsDTO = {
                productId: new Types.ObjectId(),
            };
            const query: GetProductByIdQueryDTO = {
                detail: false,
            };
            await productsController.getProductById(params, query);
            expect(searchService.send).toBeCalledWith(message, {
                productId: params.productId,
                ...query,
            });
        });
    });

    describe('createProduct', () => {
        const message = ProductsMntMessagePattern.createProduct;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const product: CreateProductRequestDTO = {
                name: 'name',
                description: 'description',
                category: new Types.ObjectId(),
                status: 1,
                generalImages: [],
                generalAttributes: [],
                variations: [],
                descriptionImages: [],
            };
            await productsController.createProduct(product);
            expect(managementsService.send).toBeCalledWith(message, product);
        });
    });

    describe('updateProduct', () => {
        const message = ProductsMntMessagePattern.updateProductPutMethod;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const params: ProductIdParamsDTO = {
                productId: new Types.ObjectId(),
            };
            const product: UpdateProductRequestDTO = {
                name: 'name',
                description: 'description',
                category: new Types.ObjectId(),
                status: 1,
                generalImages: [],
                generalAttributes: [],
                variations: [],
                descriptionImages: [],
            };
            await productsController.updateProduct(params, product);
            expect(managementsService.send).toBeCalledWith(message, {
                productId: params.productId,
                ...product,
            });
        });
    });

    describe('deleteProduct', () => {
        const message = ProductsMntMessagePattern.deleteProduct;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const params: ProductIdParamsDTO = {
                productId: new Types.ObjectId(),
            };
            await productsController.deleteProduct(params);
            expect(managementsService.send).toBeCalledWith(message, params);
        });
    });

    describe('deleteProductVariation', () => {
        const message = ProductsMntMessagePattern.deleteProductVariation;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const productIdParams: ProductIdParamsDTO = {
                productId: new Types.ObjectId(),
            };
            const skuParams: ProductSkuParamsDTO = {
                sku: 'sku',
            };
            await productsController.deleteProductVariation(productIdParams, skuParams);
            expect(managementsService.send).toBeCalledWith(message, {
                productId: productIdParams.productId,
                sku: skuParams.sku,
            });
        });
    });
});
