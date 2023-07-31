import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsLowercase, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Name of category',
        required: true,
        example: 'iPhone',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: String,
        description: "Label of category, keep in lowercase and no space, can use underscore ('_')",
        required: true,
        format: 'lowercase',
        uniqueItems: true,
        example: 'iphone',
    })
    @IsString()
    @IsNotEmpty()
    @IsLowercase()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: 'Label must only contain lowercase letters and optional underscores',
    })
    label: string;

    @ApiProperty({
        type: String,
        description: 'Description of category',
        required: true,
        example: 'This is description of category',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        type: String,
        description: 'Url of category',
        required: false,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    url: string;

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
