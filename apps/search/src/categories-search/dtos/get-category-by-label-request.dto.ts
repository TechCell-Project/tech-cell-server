import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n/class-validator-i18n';

export class GetCategoryByLabelRequestDTO {
    @ApiProperty({
        required: true,
        type: String,
        description: 'Label of category to be returned',
        example: 'android',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    label: string;
}
