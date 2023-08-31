import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetCategoriesRequestDTO {
    @ApiProperty({
        required: false,
        type: Number,
        default: 1,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page: number;

    @ApiProperty({
        required: false,
        type: Number,
        default: 10,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    pageSize: number;

    @ApiProperty({
        required: false,
        type: Boolean,
        default: false,
    })
    @Type(() => Boolean)
    @IsOptional()
    no_limit: boolean;
}
