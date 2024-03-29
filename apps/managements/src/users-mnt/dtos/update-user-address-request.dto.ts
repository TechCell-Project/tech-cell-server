import { AddressSchemaDTO } from '~libs/resource/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ArrayMaxSizeI18n, ArrayMinSizeI18n, IsArrayI18n } from '~libs/common/i18n';

export class UpdateUserAddressRequestDTO {
    @ApiProperty({
        description: 'Address of user',
        type: [AddressSchemaDTO],
        required: true,
    })
    @IsArrayI18n()
    @ArrayMinSizeI18n(0)
    @ArrayMaxSizeI18n(10)
    @Type(() => AddressSchemaDTO)
    @ValidateNested({ each: true })
    address: AddressSchemaDTO[];
}
