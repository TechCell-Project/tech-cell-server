import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetCategoryByLabelRequestDTO {
    @ApiProperty({
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    label: string;
}
