import { Attribute } from '@app/resource/attributes';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    url: string;

    @Type(() => AttributeDTO)
    requireAttributes: AttributeDTO[];
}

class AttributeDTO extends Attribute {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsOptional()
    url: string;
}
