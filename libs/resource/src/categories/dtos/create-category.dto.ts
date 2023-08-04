import { Attribute } from '@app/resource/attributes';
import { Type } from 'class-transformer';
import { IsLowercase, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsLowercase()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: 'Label must only contain lowercase letters and optional underscores',
    })
    label: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    url: string;

    @Type(() => Attribute)
    requireAttributes: Attribute[];
}
