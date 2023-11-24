import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsArrayI18n, IsStringI18n } from '~libs/common/i18n';

export class UpdateCategoryRequestDTO {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsStringI18n()
    description: string;

    @ApiProperty({
        type: Array<string>,
        description: "Attribute's label of category",
        required: false,
        example: ['name', 'email', 'phone'],
    })
    @IsOptional()
    @IsArrayI18n()
    @IsStringI18n({ each: true })
    requireAttributes: string[];
}
