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
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Category, Manufacturer, ProductStatus } from '@app/resource/products/enums';
import { AttributesDto, FilterDto, ImageDto } from '@app/resource/products/dtos';

export class UpdateProductRequestDto {
    @IsNotEmpty()
    @IsMongoId()
    idParam: string | Types.ObjectId;

    @IsString()
    @IsOptional()
    @Length(10)
    name: string;

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

    @IsNotEmpty()
    @IsEnum(Category)
    categories?: Category;

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

    @IsOptional()
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status?: number;

    @IsOptional()
    @ArrayMinSize(1)
    files?: Express.Multer.File[];
}
