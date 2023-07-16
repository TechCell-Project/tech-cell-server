import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsArray,
    IsEnum,
    Length,
    Min,
    Max,
    ArrayMinSize,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Manufacturer, ProductStatus } from '@app/resource/products/enums';

export class AttributesDto {
    @IsString()
    k: string;

    @IsNumber()
    @IsString()
    v: number | string;

    @IsOptional()
    @IsString()
    u?: string;
}

export class FilterDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    Label: string;
}

export class ImageDto {
    name: string;
    path: string;
    date_modified: Date;
}

export class CreateProductRequestDto {
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
    @ValidateNested({ each: true })
    @Type(() => ImageDto)
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
    @Min(1)
    @Max(7)
    status: number;
}
