import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetProductByIdQueryDTO {
    @ApiProperty({
        type: Boolean,
        description: 'Get detail of products',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    detail?: boolean;
}
