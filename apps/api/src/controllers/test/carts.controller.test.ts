import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import { CartsController } from '../carts.controller';
import { ORDER_SERVICE } from '~libs/common/constants';
import { TCurrentUser, THeaders } from '~libs/common/types';
import { PaginationQuery } from '~libs/common/dtos';
import {
    CartsOrdMessagePattern,
    AddCartRequestDTO,
    DeleteProductsCartRequestDTO,
} from '~apps/order/carts-ord';
import { Types } from 'mongoose';

describe(CartsController, () => {
    let cartsController: CartsController;
    let orderService: jest.Mocked<ClientRMQ>;
    let mockCurrentUser: TCurrentUser;
    let mockHeaders: jest.Mocked<THeaders>;
    let mockRmqRecord: (data: Record<string, any>) => jest.Mocked<RmqRecord>;

    beforeAll(async () => {
        const { unit, unitRef } = TestBed.create(CartsController)
            .mock<ClientRMQ>(ORDER_SERVICE)
            .using({
                send: jest.fn().mockImplementation(() => ({
                    pipe: jest.fn().mockImplementation(() => of({})),
                })),
            })
            .compile();

        cartsController = unit;
        orderService = unitRef.get<ClientRMQ>(ORDER_SERVICE);
        mockCurrentUser = {
            _id: new Types.ObjectId(),
        };
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
        expect(orderService).toBeDefined();
        expect(mockCurrentUser).toBeDefined();
    });

    describe('getCarts', () => {
        const message = CartsOrdMessagePattern.getCarts;
        test(`should called orderService.send with ${JSON.stringify(message)}`, async () => {
            const query: PaginationQuery = {
                page: 1,
                pageSize: 10,
            };
            await cartsController.getCarts(mockHeaders, query, mockCurrentUser);
            expect(orderService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    query,
                    user: mockCurrentUser,
                }),
            );
        });
    });

    describe('addCart', () => {
        const message = CartsOrdMessagePattern.addCart;
        test(`should called orderService.send with ${JSON.stringify(message)}`, async () => {
            const cartData: AddCartRequestDTO = {
                productId: new Types.ObjectId(),
                sku: 'sku',
                quantity: 1,
            };
            await cartsController.addCart(mockHeaders, cartData, mockCurrentUser);
            expect(orderService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    cartData,
                    user: mockCurrentUser,
                }),
            );
        });
    });

    describe('deleteProductsCart', () => {
        const message = CartsOrdMessagePattern.deleteProductsCart;
        test(`should called orderService.send with ${JSON.stringify(message)}`, async () => {
            const cartsData: DeleteProductsCartRequestDTO = {
                isAll: false,
            };
            await cartsController.deleteProductsCart(mockHeaders, cartsData, mockCurrentUser);
            expect(orderService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    cartsData,
                    user: mockCurrentUser,
                }),
            );
        });
    });
});
