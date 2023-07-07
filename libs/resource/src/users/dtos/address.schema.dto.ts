import { ApiProperty } from '@nestjs/swagger';

export class AddressSchemaDTO {
    @ApiProperty({ description: 'The province level address', example: 'Ha Noi' })
    provinceLevel: string;

    @ApiProperty({ description: 'The district level address', example: 'Hoang Mai' })
    districtLevel: string;

    @ApiProperty({ description: 'The commune level address', example: 'Mai Dong' })
    communeLevel: string;

    @ApiProperty({ description: 'The detailed address', example: '18 Tam Trinh' })
    detail?: string;
}
