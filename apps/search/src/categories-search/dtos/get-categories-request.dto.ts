import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetCategoriesRequestDTO {
    @ApiProperty({
        required: false,
        type: Number,
        default: 1,
    })
    @IsNumber()
    @IsOptional()
    page: number;

    @ApiProperty({
        required: false,
        type: Number,
        default: 10,
    })
    @IsNumber()
    @IsOptional()
    pageSize: number;
}
