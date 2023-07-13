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
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Manufacturer } from '../enums';

class AttributesDto {
    @IsString()
    k: string;

    @IsNumber()
    @IsString()
    v: number | string;

    @IsOptional()
    @IsString()
    u?: string;
}
class FilterDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    Label: string;
}

export class UpdateProductRequestDto {
    @IsNotEmpty()
    @IsMongoId()
    id: string;

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
    @IsString({ each: true })
    images: string[];

    @IsNotEmpty()
    @IsEnum(Category)
    categories: Category;

    @IsBoolean()
    status: boolean;

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
    @IsString()
    thumbnail: string;
}
