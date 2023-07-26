import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAttributeRequestDTO {
    @ApiProperty({
        description: 'Label of attribute',
        required: false,
        example: 'label_of_attribute',
    })
    @IsString()
    @IsOptional()
    label?: string;

    @ApiProperty({
        description: 'Name of attribute',
        required: false,
        example: 'name of attribute',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of attribute',
        required: false,
        example: 'This is a description',
    })
    @IsString()
    @IsOptional()
    description?: string;
}
