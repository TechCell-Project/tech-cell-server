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
import { AttributesDto, FilterDto, ImageDto } from './create-product.dto';
import { Category, Manufacturer, ProductStatus } from '../enums';

export class GeneralDto {
    @IsString()
    @IsOptional()
    @Length(10)
    name?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AttributesDto)
    attributes?: AttributesDto[];

    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsEnum(Manufacturer)
    manufacturer?: Manufacturer;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    images?: ImageDto[];

    @IsOptional()
    @IsEnum(Category)
    categories?: Category;
}

export class FilterableDto {
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(999999)
    stock?: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FilterDto)
    filter?: FilterDto[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    price?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    special_price?: number;

    @IsOptional()
    thumbnail?: ImageDto;
}

export class UpdateProductDto {
    @Type(() => GeneralDto)
    general?: GeneralDto;

    @Type(() => FilterableDto)
    filterable?: FilterableDto;

    @IsOptional()
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status?: number;
}
