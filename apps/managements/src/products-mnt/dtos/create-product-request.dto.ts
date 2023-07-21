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
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Manufacturer, ProductStatus } from '@app/resource/products/enums';
import { AttributesDto, FilterDto, ImageDto } from '@app/resource/products/dtos';

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

    @IsOptional()
    thumbnail?: ImageDto;

    @IsNotEmpty()
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status: number;

    @IsOptional()
    @ArrayMinSize(2)
    files?: Express.Multer.File[];
}
