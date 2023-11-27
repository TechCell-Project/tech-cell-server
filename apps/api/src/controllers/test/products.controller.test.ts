import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
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
import { THeaders } from '~libs/common/types/common.type';

describe(ProductsController, () => {
    let productsController: ProductsController;
    let managementsService: jest.Mocked<ClientRMQ>;
    let searchService: jest.Mocked<ClientRMQ>;
    let mockHeaders: jest.Mocked<THeaders>;
    let mockRmqRecord: (data: Record<string, any>) => jest.Mocked<RmqRecord>;

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
        mockHeaders = {
            lang: 'en',
        };
        mockRmqRecord = (data: Record<string, any>) =>
            new RmqRecordBuilder().setOptions({ headers: mockHeaders }).setData(data).build();
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
            await productsController.getProducts(mockHeaders, data);
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
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
            await productsController.getProductById(mockHeaders, params, query);
            expect(searchService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    productId: params.productId,
                    ...query,
                }),
            );
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
            await productsController.createProduct(mockHeaders, product);
            expect(managementsService.send).toHaveBeenCalledWith(message, mockRmqRecord(product));
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
            await productsController.updateProduct(mockHeaders, params, product);
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    productId: params.productId,
                    ...product,
                }),
            );
        });
    });

    describe('deleteProduct', () => {
        const message = ProductsMntMessagePattern.deleteProduct;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const params: ProductIdParamsDTO = {
                productId: new Types.ObjectId(),
            };
            await productsController.deleteProduct(mockHeaders, params);
            expect(managementsService.send).toHaveBeenCalledWith(message, mockRmqRecord(params));
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
            await productsController.deleteProductVariation(
                mockHeaders,
                productIdParams,
                skuParams,
            );
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    productId: productIdParams.productId,
                    sku: skuParams.sku,
                }),
            );
        });
    });
});
