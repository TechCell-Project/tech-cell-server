import { OmitType } from '@nestjs/swagger';
import { KpiDTO } from '~libs/resource/kpi';

export class CreateKpiRequestDTO extends OmitType(KpiDTO, ['_id', 'createdAt', 'updatedAt']) {}
