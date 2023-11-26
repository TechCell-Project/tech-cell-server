import { TestBed } from '@automock/jest';
import { ClientRMQ } from '@nestjs/microservices';
import { AddressController } from '../address.controller';
import { SEARCH_SERVICE } from '~libs/common/constants';
import { of } from 'rxjs';
import { AddressSearchMessagePattern } from '~apps/search/address-search/address-search.pattern';

describe(AddressController, () => {
    let addressController: AddressController;
    let searchService: jest.Mocked<ClientRMQ>;

    beforeAll(async () => {
        const { unit, unitRef } = TestBed.create(AddressController)
            .mock<ClientRMQ>(SEARCH_SERVICE)
            .using({
                send: jest.fn().mockImplementation(() => ({
                    pipe: jest.fn().mockImplementation(() => of({})),
                })),
            })
            .compile();

        addressController = unit;
        searchService = unitRef.get<ClientRMQ>(SEARCH_SERVICE);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    test('should be defined', () => {
        expect(addressController).toBeDefined();
        expect(searchService).toBeDefined();
    });

    describe('getProvinces', () => {
        test(`should called searchService.send with ${JSON.stringify(
            AddressSearchMessagePattern.getProvinces,
        )}`, async () => {
            await addressController.getProvinces({});
            expect(searchService.send).toBeCalledWith(AddressSearchMessagePattern.getProvinces, {});
        });
    });

    describe('getDistricts', () => {
        const provinceId = 201;
        test(`should called searchService.send with ${JSON.stringify(
            AddressSearchMessagePattern.getDistricts,
        )}`, async () => {
            await addressController.getDistricts({}, { province_id: provinceId });
            expect(searchService.send).toBeCalledWith(AddressSearchMessagePattern.getDistricts, {
                province_id: provinceId,
            });
        });
    });

    describe('getWards', () => {
        const districtId = 2684;
        test(`should called searchService.send with ${JSON.stringify(
            AddressSearchMessagePattern.getWards,
        )}`, async () => {
            await addressController.getWards({}, { district_id: districtId });
            expect(searchService.send).toBeCalledWith(AddressSearchMessagePattern.getWards, {
                district_id: districtId,
            });
        });
    });
});
