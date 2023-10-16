import { AddressSchemaDTO } from '@app/resource/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';

export class UpdateUserAddressRequestDTO {
    @ApiProperty({
        description: 'Address of user',
        type: [AddressSchemaDTO],
        required: true,
    })
    @ArrayMinSize(0)
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    address: [AddressSchemaDTO];
}
