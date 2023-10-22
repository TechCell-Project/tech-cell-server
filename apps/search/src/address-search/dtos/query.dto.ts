import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class QueryDistrictsDTO {
    @ApiProperty({
        type: Number,
        example: 201,
        description: 'Mã tỉnh thành',
    })
    @IsNumber()
    @Type(() => Number)
    province_id: number;
}

export class QueryWardsDTO {
    @ApiProperty({
        type: Number,
        example: 1490,
        description: 'Mã quận huyện',
    })
    @IsNumber()
    @Type(() => Number)
    district_id: number;
}
