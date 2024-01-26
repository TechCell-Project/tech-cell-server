import { Type } from 'class-transformer';
import { IsLowercase, IsOptional, Matches, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';
import { AttributeDTO } from '~libs/resource/attributes/dtos';

export class CreateCategoryDTO {
    @IsStringI18n()
    @IsNotEmptyI18n()
    name: string;

    @IsStringI18n()
    @IsNotEmptyI18n()
    @IsLowercase()
    @Matches(/^[a-z0-9_]*[a-z0-9][a-z0-9_]*$/, {
        message: i18nValidationMessage<I18nTranslations>(
            'validation.ONLY_LOWER_CASE_OPTIONAL_UNDERSCORE',
        ),
    })
    label: string;

    @IsStringI18n()
    @IsNotEmptyI18n()
    description: string;

    @IsStringI18n()
    @IsOptional()
    url: string;

    @Type(() => AttributeDTO)
    @ValidateNested({ each: true })
    requireAttributes: AttributeDTO[];
}
