import { ApiProperty } from '@nestjs/swagger';
import { SelectType } from '../enums';
import { IsOptional } from 'class-validator';
import { IsEnumI18n, IsStringI18n } from '~libs/common/i18n/class-validator-i18n';

export class SelectTypeDTO {
    @ApiProperty({
        type: String,
        enum: SelectType,
        description: 'Type of select',
        default: SelectType.onlyActive,
        required: false,
    })
    @IsOptional()
    @IsStringI18n()
    @IsEnumI18n(SelectType)
    selectType?: string;
}
