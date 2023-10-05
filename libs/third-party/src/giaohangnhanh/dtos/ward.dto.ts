import { IsEnum } from 'class-validator';
import { StatusEnum, SupportTypeEnum } from '../enums';

export class GhnWardDTO {
    constructor(data: GhnWardDTO) {
        this.DistrictID = Number(data.DistrictID);
        this.WardCode = data.WardCode;
        this.WardName = data.WardName;
        this.SupportType = Number(data.SupportType);
        this.NameExtension = data.NameExtension;
        this.CanUpdateCOD = Boolean(data.CanUpdateCOD);
        this.Status = Number(data.Status);
    }

    WardCode: string;
    DistrictID: number;
    WardName: string;
    NameExtension: string[];

    @IsEnum(SupportTypeEnum)
    SupportType: number;

    CanUpdateCOD: boolean;

    @IsEnum(StatusEnum)
    Status: number;
}
