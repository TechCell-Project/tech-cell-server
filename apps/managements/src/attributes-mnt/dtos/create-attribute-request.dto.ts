import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase, Matches, IsOptional } from 'class-validator';

export class CreateAttributeRequestDTO {
    @IsString()
    @IsNotEmpty()
    @IsLowercase()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: 'Label must only contain lowercase letters and optional underscores',
    })
    @ApiProperty({
        description:
            'Label of attribute. Must unique and only contain lowercase letters and optional underscores',
        example: 'label_of_attribute',
    })
    label: string;

    @ApiProperty({
        description: 'Name of attribute',
        example: 'name_of_attribute',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Description of attribute',
        example: 'This is a description',
    })
    @IsString()
    @IsOptional()
    description: string;
}
