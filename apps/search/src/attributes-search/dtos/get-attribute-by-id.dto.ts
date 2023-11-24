import { ApiProperty } from '@nestjs/swagger';
import {
    IsMongoIdI18n,
    IsNotEmptyI18n,
    IsStringI18n,
} from '~libs/common/i18n/class-validator-i18n';

export class GetAttributeByIdRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Id of attribute to be returned',
        required: true,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    @IsMongoIdI18n()
    attributeId: string;
}
