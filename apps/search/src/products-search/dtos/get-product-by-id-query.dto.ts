import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isTrueSet } from '~libs/common/utils/shared.util';

export class GetProductByIdQueryDTO {
    @ApiProperty({
        type: Boolean,
        description: 'Get detail of products',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => isTrueSet(value))
    detail?: boolean;
}
