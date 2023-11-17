import { AddressSchemaDTO } from '~libs/resource/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

export class UpdateUserAddressRequestDTO {
    @ApiProperty({
        description: 'Address of user',
        type: [AddressSchemaDTO],
        required: true,
    })
    @IsArray()
    @ArrayMinSize(0)
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    @Transform(({ value }) => {
        if (value && Array.isArray(value)) {
            return value.map((item) => new AddressSchemaDTO(item));
        }
        return [];
    })
    address: Array<AddressSchemaDTO>;
}
