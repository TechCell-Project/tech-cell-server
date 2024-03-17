import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../apps/api/src/app.module';
import { INestApplication } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { I18nValidationPipe } from 'nestjs-i18n';
import { HttpExceptionFilter, RpcExceptionFilter, UTILITY_SERVICE } from '~libs/common';

describe('/address', () => {
    let app: INestApplication;
    let utilityService: ClientRMQ;

    beforeAll(async () => {
        const clientMock = {
            emit: jest.fn(),
            send: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
            providers: [{ provide: UTILITY_SERVICE, useValue: clientMock }],
        }).compile();

        app = moduleRef.createNestApplication();

        utilityService = app.get<ClientRMQ>(UTILITY_SERVICE);
        app.useGlobalFilters(
            new HttpExceptionFilter(utilityService),
            new RpcExceptionFilter(utilityService),
        );
        app.useGlobalPipes(
            new I18nValidationPipe({
                transform: true,
            }),
        );
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /provinces', () => {
        it('should return list of provinces with 200', () => {
            return request(app.getHttpServer()).get('/address/provinces').expect(200);
        });
    });

    describe('GET /districts/:province_id', () => {
        it('should return list of districts', () => {
            return request(app.getHttpServer()).get('/address/districts/201').expect(200);
        });

        it('should return 400 when province_id is not valid', () => {
            return request(app.getHttpServer()).get('/address/districts/abc').expect(400);
        });

        it('should return 400 when province_id is not valid', () => {
            return request(app.getHttpServer()).get('/address/districts/0').expect(400);
        });

        it('should return 404 when province_id is not found', () => {
            return request(app.getHttpServer()).get('/address/districts/90090').expect(404);
        });
    });

    describe('GET /wards/:district_id', () => {
        it('should return list of wards', () => {
            return request(app.getHttpServer()).get('/address/wards/3440').expect(200);
        });

        it('should return 400 when district_id is not valid', () => {
            return request(app.getHttpServer()).get('/address/wards/abc').expect(400);
        });

        it('should return 400 when district_id is not valid', () => {
            return request(app.getHttpServer()).get('/address/wards/abc').expect(400);
        });

        it('should return 400 when district_id is not valid', () => {
            return request(app.getHttpServer()).get('/address/wards/0').expect(400);
        });

        it('should return 404 when district_id is not found', () => {
            return request(app.getHttpServer()).get('/address/wards/99990').expect(404);
        });
    });
});
