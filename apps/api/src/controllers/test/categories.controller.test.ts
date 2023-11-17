import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ } from '@nestjs/microservices';
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

describe(CategoriesController, () => {
    let cartsController: CategoriesController;
    let managementsService: jest.Mocked<ClientRMQ>;
    let searchService: jest.Mocked<ClientRMQ>;

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
            await cartsController.getCategories(data);
            expect(searchService.send).toBeCalledWith(message, data);
        });
    });

    describe('getCategoryByLabel', () => {
        const message = CategoriesSearchMessagePattern.getCategoryByLabel;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: GetCategoryByLabelRequestDTO = {
                label: 'label',
            };
            await cartsController.getCategoryByLabel(data);
            expect(searchService.send).toBeCalledWith(message, data);
        });
    });

    describe('getCategoryById', () => {
        const message = CategoriesSearchMessagePattern.getCategoryById;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const data: CategoryIdParam = {
                categoryId: new Types.ObjectId(),
            };
            await cartsController.getCategoryById(data);
            expect(searchService.send).toBeCalledWith(message, data);
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
            await cartsController.createCategory(data);
            expect(managementsService.send).toBeCalledWith(message, data);
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
            await cartsController.updateCategory(param, data);
            expect(managementsService.send).toBeCalledWith(message, { ...param, ...data });
        });
    });
});
