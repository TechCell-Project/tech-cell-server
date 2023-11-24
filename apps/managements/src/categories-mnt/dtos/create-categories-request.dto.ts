import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsArrayI18n, IsLowercaseI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class CreateCategoryRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Name of category',
        required: true,
        example: 'iPhone',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    name: string;

    @ApiProperty({
        type: String,
        description: "Label of category, keep in lowercase and no space, can use underscore ('_')",
        required: true,
        format: 'lowercase',
        uniqueItems: true,
        example: 'iphone',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @IsLowercaseI18n()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: i18nValidationMessage('validation.ONLY_LOWER_CASE_OPTIONAL_UNDERSCORE'),
    })
    label: string;

    @ApiProperty({
        type: String,
        description: 'Description of category',
        required: true,
        example: 'This is description of category',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    description: string;

    @ApiProperty({
        type: String,
        description: 'Url of category',
        required: false,
        nullable: true,
    })
    @IsStringI18n()
    @IsOptional()
    url: string;

    @ApiProperty({
        type: Array<string>,
        description: "Attribute's label of category",
        required: false,
        example: ['name', 'email', 'phone'],
    })
    @IsArrayI18n()
    @IsOptional()
    @IsStringI18n({ each: true })
    requireAttributes: string[];
}
