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
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../enums';
import { VariationSchema } from '../schemas';

export class CreateProductDTO {
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
    categories: string[];

    @IsNumber()
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    status: ProductStatus;

    @IsArray()
    @IsOptional()
    generalAttributes: Array<AttributeDTO>;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationDTO)
    variations: VariationDTO[];
}

class VariationDTO implements VariationSchema {
    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    attributes: Array<AttributeDTO>;

    price: PriceDTO;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(9000000)
    stock: number;

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
