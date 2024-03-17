import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumberI18n, MinI18n } from '~libs/common/i18n/class-validator-i18n';

export class QueryDistrictsDTO {
    @ApiProperty({
        type: Number,
        example: 201,
        description: 'Mã tỉnh thành',
    })
    @IsNumberI18n()
    @Type(() => Number)
    @MinI18n(1)
    province_id: number;
}

export class QueryWardsDTO {
    @ApiProperty({
        type: Number,
        example: 1490,
        description: 'Mã quận huyện',
    })
    @IsNumberI18n()
    @Type(() => Number)
    @MinI18n(1)
    district_id: number;
}
