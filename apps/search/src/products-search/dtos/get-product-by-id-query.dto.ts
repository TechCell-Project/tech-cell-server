import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isTrueSet } from '~libs/common/utils/shared.util';
import { IsBooleanI18n, IsEnumI18n, IsStringI18n } from '~libs/common/i18n/class-validator-i18n';
import { SelectType } from '~apps/search/enums/select-type.enum';

export class GetProductByIdQueryDTO {
    @ApiProperty({
        type: Boolean,
        description: 'Get detail of products',
        required: false,
    })
    @IsOptional()
    @IsBooleanI18n()
    @Transform(({ value }) => isTrueSet(value))
    detail?: boolean;

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
    select_type?: string;
}
