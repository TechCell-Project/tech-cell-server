import { Test, TestingModule } from '@nestjs/testing';
import { KpiService } from './kpi.service';

describe('KpiService', () => {
    let service: KpiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [KpiService],
        }).compile();

        service = module.get<KpiService>(KpiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
