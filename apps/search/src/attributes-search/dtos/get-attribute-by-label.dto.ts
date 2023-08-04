import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAttributeByLabelRequestDTO {
    @ApiProperty({
        type: String,
        description: 'label of attribute to be returned',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    label: string;
}
