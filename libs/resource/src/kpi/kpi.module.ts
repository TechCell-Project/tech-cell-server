import { Module } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { KpiRepository } from './kpi.repository';
import { I18nModule } from '~libs/common/i18n';
import { MongodbModule } from '~libs/common/database';
import { MongooseModule } from '@nestjs/mongoose';
import { Kpi, KpiSchema } from './schemas';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Kpi.name, schema: KpiSchema }]),
    ],
    providers: [KpiService, KpiRepository],
    exports: [KpiService],
})
export class KpiModule {}
