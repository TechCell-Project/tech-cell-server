import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import { AttributesController } from '../attributes.controller';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { AttributesSearchMessagePattern } from '~apps/search/attributes-search/attributes-search.pattern';
import { AttributesMntMessagePattern } from '~apps/managements/attributes-mnt/attributes-mnt.pattern';
import { CreateAttributeRequestDTO } from '~apps/managements/attributes-mnt/dtos';

describe(AttributesController, () => {
    let attributesController: AttributesController;
    let managementsService: jest.Mocked<ClientRMQ>;
    let searchService: jest.Mocked<ClientRMQ>;
    let mockRmqRecord: (data: Record<string, any>) => jest.Mocked<RmqRecord>;

    beforeAll(async () => {
        const mockUsing = {
            send: jest.fn().mockImplementation(() => ({
                pipe: jest.fn().mockImplementation(() => of({})),
            })),
        };
        const { unit, unitRef } = TestBed.create(AttributesController)
            .mock<ClientRMQ>(SEARCH_SERVICE)
            .using(mockUsing)
            .mock<ClientRMQ>(MANAGEMENTS_SERVICE)
            .using(mockUsing)
            .compile();

        attributesController = unit;
        searchService = unitRef.get<ClientRMQ>(SEARCH_SERVICE);
        managementsService = unitRef.get<ClientRMQ>(MANAGEMENTS_SERVICE);
        mockRmqRecord = (data: Record<string, any>) =>
            new RmqRecordBuilder().setOptions({ headers: {} }).setData(data).build();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    test('should be defined', () => {
        expect(searchService).toBeDefined();
        expect(managementsService).toBeDefined();
        expect(attributesController).toBeDefined();
    });

    describe('attributesController.getAttributes', () => {
        const message = AttributesSearchMessagePattern.getAttributes;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            await attributesController.getAttributes({}, {});
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord({}));
        });
    });

    describe('attributesController.getAttributeById', () => {
        const message = AttributesSearchMessagePattern.getAttributeById;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const attributeId = '1';
            await attributesController.getAttributeById({}, { attributeId });
            expect(searchService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({ attributeId }),
            );
        });
    });

    describe('attributesController.getAttributesByLabel', () => {
        const message = AttributesSearchMessagePattern.getAttributeByLabel;
        test(`should called searchService.send with ${JSON.stringify(message)}`, async () => {
            const label = 'label';
            await attributesController.getAttributesByLabel({}, { label });
            expect(searchService.send).toHaveBeenCalledWith(message, mockRmqRecord({ label }));
        });
    });

    describe('attributesController.createAttribute', () => {
        const message = AttributesMntMessagePattern.createAttribute;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const data: CreateAttributeRequestDTO = {
                label: 'label',
                name: 'name',
                description: 'description',
            };
            await attributesController.createAttribute({}, data);
            expect(managementsService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('attributesController.updateAttributeInfo', () => {
        const message = AttributesMntMessagePattern.updateAttributeInfo;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const attributeId = '1';
            const data: CreateAttributeRequestDTO = {
                label: 'label',
                name: 'name',
                description: 'description',
            };
            await attributesController.updateAttributeInfo({}, attributeId, data);
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({ attributeId, ...data }),
            );
        });
    });

    describe('attributesController.deleteAttribute', () => {
        const message = AttributesMntMessagePattern.deleteAttribute;
        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const attributeId = '1';
            await attributesController.deleteAttribute({}, { attributeId });
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({ attributeId }),
            );
        });
    });
});
