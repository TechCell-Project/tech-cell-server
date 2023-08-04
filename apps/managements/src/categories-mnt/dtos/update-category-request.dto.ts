import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateCategoryRequestDTO {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        type: Array<string>,
        description: "Attribute's label of category",
        required: false,
        example: ['name', 'email', 'phone'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    requireAttributes: string[];
}
