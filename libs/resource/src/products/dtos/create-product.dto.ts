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
import { Category, Manufacturer, ProductStatus } from '../enums';

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
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    path: string;

    @IsNotEmpty()
    @IsDate()
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
