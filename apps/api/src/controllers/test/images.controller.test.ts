import { of } from 'rxjs';
import { TestBed } from '@automock/jest';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import { ImagesController } from '../images.controller';
import { MANAGEMENTS_SERVICE } from '~libs/common/constants';
import { PublicIdDTO } from '~apps/managements/images-mnt/dtos/publicId.dto';
import { ImagesMntMessagePattern } from '~apps/managements/images-mnt/images-mnt.pattern';
import { Request } from 'express';
import { THeaders } from '~libs/common/types/common.type';

describe(ImagesController, () => {
    let imagesController: ImagesController;
    let managementsService: jest.Mocked<ClientRMQ>;
    let imageMock: Express.Multer.File;
    let imageMockArray: Express.Multer.File[];
    let requestMock: Request;
    let mockHeaders: jest.Mocked<THeaders>;
    let mockRmqRecord: (data: Record<string, any>) => jest.Mocked<RmqRecord>;

    beforeAll(async () => {
        const { unit, unitRef } = TestBed.create(ImagesController)
            .mock<ClientRMQ>(MANAGEMENTS_SERVICE)
            .using({
                send: jest.fn().mockImplementation(() => ({
                    pipe: jest.fn().mockImplementation(() => of({})),
                })),
            })
            .compile();

        imagesController = unit;
        managementsService = unitRef.get<ClientRMQ>(MANAGEMENTS_SERVICE);
        imageMock = {
            buffer: Buffer.from('any_buffer'),
            encoding: 'any_encoding',
            fieldname: 'any_fieldname',
            mimetype: 'any_mimetype',
            originalname: 'any_originalname',
            size: 1,
            stream: null,
            destination: 'any_destination',
            filename: 'any_filename',
            path: 'any_path',
        };
        imageMockArray = [imageMock];
        requestMock = {
            protocol: 'any_protocol',
            headers: {
                host: 'any_host',
            },
        } as any;
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
        expect(imagesController).toBeDefined();
        expect(managementsService).toBeDefined();
        expect(imageMock).toBeDefined();
        expect(imageMockArray).toBeDefined();
    });

    describe('getImageByPublicId', () => {
        const message = ImagesMntMessagePattern.getImageByPublicId;

        test('should be defined', () => {
            expect(imagesController.getImageByPublicId).toBeDefined();
        });

        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            const data: PublicIdDTO = {
                publicId: 'publicId',
            };
            await imagesController.getImageByPublicId(mockHeaders, data);
            expect(managementsService.send).toHaveBeenCalledWith(message, mockRmqRecord(data));
        });
    });

    describe('uploadImages', () => {
        const message = ImagesMntMessagePattern.uploadSingleImage;

        test('should be defined', () => {
            expect(imagesController.uploadSingleImage).toBeDefined();
        });

        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            await imagesController.uploadSingleImage(mockHeaders, imageMock, requestMock);
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    image: imageMock,
                    imageUrl: ImagesController.buildUploadImageUrl(requestMock, imageMock.filename),
                }),
            );
        });
    });

    describe('uploadArrayImage', () => {
        const message = ImagesMntMessagePattern.uploadArrayImage;

        test('should be defined', () => {
            expect(imagesController.uploadArrayImages).toBeDefined();
        });

        test(`should called managementsService.send with ${JSON.stringify(message)}`, async () => {
            await imagesController.uploadArrayImages(mockHeaders, imageMockArray, requestMock);
            expect(managementsService.send).toHaveBeenCalledWith(
                message,
                mockRmqRecord({
                    images: imageMockArray,
                    imageUrls: imageMockArray.map((image) =>
                        ImagesController.buildUploadImageUrl(requestMock, image.filename),
                    ),
                }),
            );
        });
    });
});
