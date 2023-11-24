import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class DeleteAttributeByIdRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Id of attribute to be delete',
        required: true,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    attributeId: string;
}
