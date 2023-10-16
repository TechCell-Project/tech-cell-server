import { ApiProperty } from '@nestjs/swagger';
import { AddressSchema } from '../schemas/address.schema';
import { IsBoolean, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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

    @ApiProperty({ description: 'The province level address', example: 'Ha Noi' })
    @IsString()
    @IsNotEmpty()
    provinceLevel: string;

    @ApiProperty({ description: 'The district level address', example: 'Hoang Mai' })
    @IsString()
    @IsNotEmpty()
    districtLevel: string;

    @ApiProperty({ description: 'The ward level address', example: 'Mai Dong' })
    @IsString()
    @IsNotEmpty()
    wardLevel: string;

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
