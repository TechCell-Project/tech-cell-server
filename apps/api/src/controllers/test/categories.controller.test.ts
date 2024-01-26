import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import { CategoriesController } from '../categories.controller';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import {
    CategoriesSearchMessagePattern,
    GetCategoriesRequestDTO,
    GetCategoryByLabelRequestDTO,
} from '~apps/search/categories-search';
import {
    CategoriesMntMessagePattern,
    CreateCategoryRequestDTO,
    UpdateCategoryRequestDTO,
} from '~apps/managements/categories-mnt';
import { CategoryIdParam } from '~libs/resource/categories/dtos';
import { Types } from 'mongoose';
import { THeaders } from '~libs/common/types/common.type';

describe(CategoriesController, () => {
    let cartsController: CategoriesController;
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
        const { unit, unitRef } = TestBed.create(CategoriesController)
            .mock<ClientRMQ>(MANAGEMENTS_SERVICE)
            .using(mockUsing)
            .mock<ClientRMQ>(SEARCH_SERVICE)
            .using(mockUsing)
            .compile();

        cartsController = unit;
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
        expect(cartsController).toBeDefined();
        expect(managementsService).toBeDefined();
        expect(searchService).toBeDefined();
    });

    describe('getCategories', () => {
        const message = CategoriesSearchMessagePattern.getCategories;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: GetCategoriesRequestDTO = {
                page: 1,
                pageSize: 10,
            };
            await cartsController.getCategories(mockHeaders, data);
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('getCategoryByLabel', () => {
        const message = CategoriesSearchMessagePattern.getCategoryByLabel;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: GetCategoryByLabelRequestDTO = {
                label: 'label',
            };
            await cartsController.getCategoryByLabel(mockHeaders, data);
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('getCategoryById', () => {
        const message = CategoriesSearchMessagePattern.getCategoryById;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: CategoryIdParam = {
                categoryId: new Types.ObjectId(),
            };
            await cartsController.getCategoryById(mockHeaders, data);
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('createCategory', () => {
        const message = CategoriesMntMessagePattern.createCategory;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const data: CreateCategoryRequestDTO = {
                label: 'label',
                description: 'description',
                name: 'name',
                requireAttributes: [],
                url: 'url',
            };
            await cartsController.createCategory(mockHeaders, data);
            expect(managementsService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('updateCategory', () => {
        const message = CategoriesMntMessagePattern.updateCategory;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const data: UpdateCategoryRequestDTO = {
                description: 'description',
                requireAttributes: [],
            };
            const param: CategoryIdParam = {
                categoryId: new Types.ObjectId(),
            };
            await cartsController.updateCategory(mockHeaders, param, data);
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({ ...param, ...data }),
            );
        });
    });
});
