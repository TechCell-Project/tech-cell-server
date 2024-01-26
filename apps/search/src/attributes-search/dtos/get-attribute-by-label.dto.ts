import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n/class-validator-i18n';

export class GetAttributeByLabelRequestDTO {
    @ApiProperty({
        type: String,
        description: 'label of attribute to be returned',
        required: true,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    label: string;
}
