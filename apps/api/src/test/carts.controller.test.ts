import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ } from '@nestjs/microservices';
import { CartsController } from '../controllers/carts.controller';
import { ORDER_SERVICE } from '~libs/common/constants';
import { TCurrentUser } from '~libs/common/types';
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
            await cartsController.getCarts(query, mockCurrentUser);
            expect(orderService.send).toBeCalledWith(message, { query, user: mockCurrentUser });
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
            await cartsController.addCart(cartData, mockCurrentUser);
            expect(orderService.send).toBeCalledWith(message, {
                cartData,
                user: mockCurrentUser,
            });
        });
    });

    describe('deleteProductsCart', () => {
        const message = CartsOrdMessagePattern.deleteProductsCart;
        test(`should called orderService.send with ${JSON.stringify(message)}`, async () => {
            const cartsData: DeleteProductsCartRequestDTO = {
                isAll: false,
            };
            await cartsController.deleteProductsCart(cartsData, mockCurrentUser);
            expect(orderService.send).toBeCalledWith(message, {
                cartsData,
                user: mockCurrentUser,
            });
        });
    });
});
