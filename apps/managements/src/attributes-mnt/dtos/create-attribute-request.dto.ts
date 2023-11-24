import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsLowercaseI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class CreateAttributeRequestDTO {
    @ApiProperty({
        description:
            'Label of attribute. Must unique and only contain lowercase letters and optional underscores',
        example: 'label_of_attribute',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @IsLowercaseI18n()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: i18nValidationMessage('validation.ONLY_LOWER_CASE_OPTIONAL_UNDERSCORE'),
    })
    label: string;

    @ApiProperty({
        description: 'Name of attribute',
        example: 'name_of_attribute',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    name: string;

    @ApiProperty({
        description: 'Description of attribute',
        example: 'This is a description',
    })
    @IsStringI18n()
    @IsOptional()
    description: string;
}
