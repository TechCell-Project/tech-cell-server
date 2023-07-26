import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAttributeRequestDTO {
    @ApiProperty({
        description: 'Label of attribute',
    })
    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Name of attribute',
    })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Description of attribute',
    })
    description?: string;
}
