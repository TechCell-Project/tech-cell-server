import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAttributeByIdRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Id of attribute to be delete',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    attributeId: string;
}
