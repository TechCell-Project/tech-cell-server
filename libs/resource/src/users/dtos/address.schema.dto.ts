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
    IsPhoneNumber,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class ProvinceSchemaDTO implements ProvinceSchema {
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
    @ApiProperty({ description: 'The id of ward', example: '1A0807' })
    @IsNotEmpty()
    ward_id: string;

    @ApiProperty({ description: 'The name of ward', example: 'Phường Mai Động' })
    @IsString()
    @IsNotEmpty()
    ward_name: string;
}

export class AddressSchemaDTO implements AddressSchema {
    @ApiProperty({ description: 'The name of address', example: 'Home' })
    @IsString()
    @IsNotEmpty()
    addressName: string;

    @ApiProperty({ description: 'The name of customer', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @ApiProperty({ description: 'The phone number of customer', example: '0123456789' })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumbers: string;

    @ApiProperty({ description: 'The province level address', type: ProvinceSchemaDTO })
    @ValidateNested()
    provinceLevel: ProvinceSchemaDTO;

    @ApiProperty({ description: 'The district level address', type: DistrictSchemaDTO })
    @ValidateNested()
    districtLevel: DistrictSchemaDTO;

    @ApiProperty({ description: 'The ward level address', type: WardSchemaDTO })
    @ValidateNested()
    wardLevel: WardSchemaDTO;

    @ApiProperty({ description: 'The detailed address', example: '18 Tam Trinh' })
    @IsString()
    @IsNotEmpty()
    detail: string;

    @ApiProperty({
        description: 'The boolean value to check if this address is default or not',
    })
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isDefault: boolean;
}
