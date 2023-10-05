import { IsEnum } from 'class-validator';
import { SupportTypeEnum, StatusEnum } from '../enums';

export class GhnDistrictDTO {
    constructor(data: GhnDistrictDTO) {
        this.DistrictID = Number(data.DistrictID);
        this.DistrictName = data.DistrictName;
        this.SupportType = Number(data.SupportType);
        this.NameExtension = data.NameExtension;
        this.CanUpdateCOD = Boolean(data.CanUpdateCOD);
        this.Status = Number(data.Status);
    }

    ProvinceID: number;
    DistrictID: number;
    DistrictName: string;

    @IsEnum(SupportTypeEnum)
    SupportType: number;

    NameExtension: string[];
    CanUpdateCOD: boolean;

    @IsEnum(StatusEnum)
    Status: number;
}
