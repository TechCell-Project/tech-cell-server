import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    Length,
    Min,
    Max,
    IsArray,
    ArrayMinSize,
    IsDate,
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
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    path: string;

    @IsNumber()
    @IsNotEmpty()
    index: number;

    @IsNotEmpty()
    @IsDate()
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

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    images?: ImageDto[];

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
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status: number;

    @IsOptional()
    thumbnail?: ImageDto;

    @IsOptional()
    files?: any;
}
