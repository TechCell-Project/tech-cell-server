import { AddressSchemaDTO } from '@app/resource/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
    @Transform(({ value }) => value.map((addr) => new AddressSchemaDTO(addr)))
    address: Array<AddressSchemaDTO>;
}
