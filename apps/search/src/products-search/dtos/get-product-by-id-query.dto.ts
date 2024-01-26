import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isTrueSet } from '~libs/common/utils/shared.util';
import { IsBooleanI18n } from '~libs/common/i18n/class-validator-i18n';

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
}
