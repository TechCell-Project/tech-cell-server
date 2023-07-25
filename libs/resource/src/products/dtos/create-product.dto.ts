import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    IsEnum,
    Length,
    Min,
    Max,
    ArrayMinSize,
    ValidateNested,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Category, Manufacturer, ProductStatus } from '../enums';

export class AttributesDto {
    @ApiProperty({
        description: 'The attribute key',
        example: 'Storage',
    })
    @IsNotEmpty()
    @IsString()
    k: string;

    @ApiProperty({
        description: 'The attribute value',
        example: '512',
    })
    @IsNotEmpty()
    @IsString()
    v: string;

    @ApiProperty({
        description: 'The unit of attribute',
        example: 'GB',
        required: false,
    })
    @IsOptional()
    @IsString()
    u?: string;
}

export class FilterDto {
    @ApiProperty({
        description: 'The filter id',
        example: 'manufacturer',
    })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty({
        description: 'The filter label',
        example: 'Samsung',
    })
    @IsNotEmpty()
    @IsString()
    Label: string;
}

export class ImageDto {
    @ApiProperty({
        description: 'File name',
    })
    @IsNotEmpty()
    @IsString()
    file_name: string;

    @ApiProperty({
        description: 'Image URL',
        example:
            'https://res.cloudinary.com/doij577wy/image/upload/v1683643826/GearFun/avatar1683643825087.webp',
    })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({
        description: 'Public_id of the image return by cloudinary',
        example: 'GB',
    })
    @IsString()
    @IsNotEmpty()
    cloudinary_id: string;

    @ApiProperty({
        description: 'The time the file was uploaded',
        example: '2023-07-20T019:11:45.031Z',
    })
    @IsDate()
    @IsNotEmpty()
    date_modified: Date;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @Length(10)
    name: string;

    @ValidateNested({ each: true })
    @Type(() => AttributesDto)
    attributes: AttributesDto[];

    @IsOptional()
    @IsString()
    sku?: string;

    @IsNotEmpty()
    @IsEnum(Manufacturer)
    manufacturer: Manufacturer;

    @IsArray()
    @ArrayMinSize(1)
    images: ImageDto[];

    @IsNotEmpty()
    @IsEnum(Category)
    categories: Category;

    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    @Max(999999)
    stock: number;

    @ValidateNested({ each: true })
    @Type(() => FilterDto)
    filter: FilterDto[];

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    price: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    special_price: number;

    @IsNotEmpty()
    thumbnail: ImageDto;

    @IsNotEmpty()
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status: number;
}
