import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsEnum,
    ArrayMinSize,
    ValidateNested,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, ProductStatus } from '@app/resource/products/enums';

export class CreateProductRequestDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsArray()
    @IsNotEmpty()
    @IsEnum(Category, { each: true })
    categories: string[];

    @IsNumber()
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    status: number;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationDTO)
    variations: VariationDTO[];
}

class VariationDTO {
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    attributes: Array<AttributeDTO>;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(9000000)
    stock: number;

    price: PriceDTO;
    images: Array<ImageDTO>;
}

class AttributeDTO {
    @IsString()
    @IsNotEmpty()
    k: string;

    @IsString()
    @IsNotEmpty()
    v: string;

    @IsString()
    u?: string;
}

class ImageDTO {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    alt: string;
}

class PriceDTO {
    @IsNumber()
    @IsNotEmpty()
    base: number;

    @IsNumber()
    @IsNotEmpty()
    sale: number;

    @IsNumber()
    @IsNotEmpty()
    special: number;
}
