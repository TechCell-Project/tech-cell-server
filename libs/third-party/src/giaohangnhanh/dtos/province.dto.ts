import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusEnum } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { GhnProvince } from 'giaohangnhanh';

export class GhnProvinceDTO {
    constructor(data: GhnProvince) {
        this.province_id = Number(data.ProvinceID);
        this.province_name = data.ProvinceName;
        this.country_id = Number(data.CountryID);
        this.name_extension = data.NameExtension;
        this.status = Number(data.Status);
    }

    @ApiProperty({
        example: 201,
        description: 'Mã tỉnh thành',
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    province_id: number;

    @ApiProperty({
        example: 'Hà Nội',
        description: 'Tên tỉnh thành',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    province_name: string;

    @ApiProperty({
        example: 1,
        description: 'Mã quốc gia',
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    country_id: number;

    @ApiProperty({
        example: [
            'Hà Nội',
            'TP.Hà Nội',
            'TP. Hà Nội',
            'TP Hà Nội',
            'Thành phố Hà Nội',
            'hanoi',
            'HN',
            'ha noi',
        ],
        description: 'Tên tỉnh thành mở rộng',
        type: [String],
    })
    @IsArray()
    name_extension: string[];

    @ApiProperty({
        example: 1,
        description: 'Trạng thái',
        type: Number,
        enum: StatusEnum,
    })
    @IsEnum(StatusEnum)
    status: number;
}
