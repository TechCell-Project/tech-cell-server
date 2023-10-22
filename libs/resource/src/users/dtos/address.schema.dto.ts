import { ApiProperty } from '@nestjs/swagger';
import {
    AddressSchema,
    DistrictSchema,
    ProvinceSchema,
    WardSchema,
} from '../schemas/address.schema';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class ProvinceSchemaDTO implements ProvinceSchema {
    constructor(province: ProvinceSchema) {
        this.province_id = province.province_id;
        this.province_name = province.province_name;
    }

    @ApiProperty({ description: 'The id of province', example: 201 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    province_id: number;

    @ApiProperty({ description: 'The name of province', example: 'Hà Nội' })
    @IsString()
    @IsNotEmpty()
    province_name: string;
}

class DistrictSchemaDTO implements DistrictSchema {
    constructor(district: DistrictSchema) {
        this.district_id = district.district_id;
        this.district_name = district.district_name;
    }

    @ApiProperty({ description: 'The id of district', example: 1490 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    district_id: number;

    @ApiProperty({ description: 'The name of district', example: 'Quận Hoàng Mai' })
    @IsString()
    @IsNotEmpty()
    district_name: string;
}

class WardSchemaDTO implements WardSchema {
    constructor(ward: WardSchema) {
        this.ward_code = ward.ward_code;
        this.ward_name = ward.ward_name;
    }

    @ApiProperty({ description: 'The code of ward', example: '1A0807' })
    @IsNotEmpty()
    @IsString()
    ward_code: string;

    @ApiProperty({ description: 'The name of ward', example: 'Phường Mai Động' })
    @IsString()
    @IsNotEmpty()
    ward_name: string;
}

export class AddressSchemaDTO implements AddressSchema {
    constructor(address: AddressSchemaDTO) {
        this.addressName = address.addressName;
        this.customerName = address?.customerName;
        this.phoneNumbers = address.phoneNumbers;
        this.provinceLevel = new ProvinceSchemaDTO(address.provinceLevel);
        this.districtLevel = new DistrictSchemaDTO(address.districtLevel);
        this.wardLevel = new WardSchemaDTO(address.wardLevel);
        this.detail = address.detail;
        this.isDefault = address.isDefault;
    }

    @ApiProperty({ description: 'The name of address', example: 'Home' })
    @IsString()
    @IsNotEmpty()
    addressName: string;

    @ApiProperty({ description: 'The name of customer', example: 'John Doe', required: false })
    @IsOptional()
    @IsNotEmpty()
    customerName: string;

    @ApiProperty({ description: 'The phone number of customer', example: '0123456789' })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumbers: string;

    @ApiProperty({ description: 'The province level address', type: ProvinceSchemaDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => ProvinceSchemaDTO)
    provinceLevel: ProvinceSchemaDTO;

    @ApiProperty({ description: 'The district level address', type: DistrictSchemaDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => DistrictSchemaDTO)
    districtLevel: DistrictSchemaDTO;

    @ApiProperty({ description: 'The ward level address', type: WardSchemaDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => WardSchemaDTO)
    wardLevel: WardSchemaDTO;

    @ApiProperty({ description: 'The detailed address', example: '18 Tam Trinh' })
    @IsString()
    @IsNotEmpty()
    detail: string;

    @ApiProperty({
        description: 'The boolean value to check if this address is default or not',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isDefault: boolean;
}
