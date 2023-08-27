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
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../enums';
import { AttributeSchema, VariationSchema } from '../schemas';
import { ImageSchema } from '../schemas/image.schema';

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @IsNotEmpty()
    categories: string[];

    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsArray()
    @IsOptional()
    generalAttributes: Array<AttributeDTO>;

    @IsArray()
    @IsOptional()
    generalImages: ImageDTO[];

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

    @IsArray()
    @Type(() => ImageDTO)
    images: ImageDTO[];
}

class AttributeDTO implements AttributeSchema {
    @IsString()
    @IsNotEmpty()
    k: string;

    @IsString()
    @IsNotEmpty()
    v: string;

    @IsString()
    @IsOptional()
    u?: string;
}

class ImageDTO implements ImageSchema {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    publicId: string;

    @IsOptional()
    @IsBoolean()
    isThumbnail?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}

class PriceDTO {
    @IsNumber()
    @IsNotEmpty()
    base: number;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    sale?: number;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    special?: number;
}
