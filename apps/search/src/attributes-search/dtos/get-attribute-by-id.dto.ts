import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAttributeByIdRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Id of attribute to be returned',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    attributeId: string;
}
