import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsStringI18n } from '~libs/common/i18n';

export class UpdateAttributeRequestDTO {
    @ApiProperty({
        description: 'Label of attribute',
        required: false,
        example: 'label_of_attribute',
    })
    @IsOptional()
    @IsStringI18n()
    label?: string;

    @ApiProperty({
        description: 'Name of attribute',
        required: false,
        example: 'name of attribute',
    })
    @IsOptional()
    @IsStringI18n()
    name?: string;

    @ApiProperty({
        description: 'Description of attribute',
        required: false,
        example: 'This is a description',
    })
    @IsOptional()
    @IsStringI18n()
    description?: string;
}
