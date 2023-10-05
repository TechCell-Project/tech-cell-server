import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, validate } from 'class-validator';
import { StatusEnum } from '../enums';

export class GhnProvinceDTO {
    constructor(data: GhnProvinceDTO) {
        this.ProvinceID = Number(data.ProvinceID);
        this.ProvinceName = data.ProvinceName;
        this.CountryID = Number(data.CountryID);
        this.NameExtension = data.NameExtension;
        this.Status = Number(data.Status);
        this.validate();
    }

    validate() {
        validate(this).then((errors) => {
            if (errors.length > 0) {
                throw errors;
            }
        });
    }

    @IsNumber()
    @IsNotEmpty()
    ProvinceID: number;

    @IsString()
    @IsNotEmpty()
    ProvinceName: string;

    @IsNumber()
    @IsNotEmpty()
    CountryID: number;

    @IsArray()
    NameExtension: string[];

    @IsEnum(StatusEnum)
    Status: number;
}
