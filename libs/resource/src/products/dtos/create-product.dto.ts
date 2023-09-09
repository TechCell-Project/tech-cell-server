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
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';

export class CreateProductDTO {
    constructor(data: CreateProductRequestDTO) {
        this.name = data.name;
        this.description = data.description;
        this.categories = data.categories;
        this.status = data.status;
        this.generalAttributes = data.generalAttributes;
        this.generalImages = [];
        this.variations = [];
    }

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
    status?: number;

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

    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: number;
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

export class ImageDTO implements ImageSchema {
    constructor(data: ImageSchema) {
        this.url = data.url;
        this.publicId = data.publicId;
        this.isThumbnail = data.isThumbnail ?? false;
    }

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    publicId: string;

    @IsOptional()
    @IsBoolean()
    isThumbnail?: boolean;
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
