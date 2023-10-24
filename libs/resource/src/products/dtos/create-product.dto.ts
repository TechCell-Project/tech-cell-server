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
    IsMongoId,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '../enums';
import { AttributeSchema, VariationSchema } from '../schemas';
import { ImageSchema } from '../schemas/image.schema';
import { CreateProductRequestDTO } from '~apps/managements/products-mnt/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { isTrueSet } from '@app/common/utils/shared.util';

class AttributeDTO implements AttributeSchema {
    @ApiProperty({
        description: 'Key of attribute',
        example: 'ram',
    })
    @IsString()
    @IsNotEmpty()
    k: string;

    @ApiProperty({
        description: 'Value of attribute',
        example: '16',
    })
    @IsString()
    @IsNotEmpty()
    v: string;

    @ApiProperty({
        description: 'Unit of attribute',
        example: 'GB',
        required: false,
    })
    @IsString()
    @IsOptional()
    u?: string;
}

class PriceDTO {
    @ApiProperty({
        description: 'Base price',
        example: 1000000,
    })
    @IsNumber()
    @IsNotEmpty()
    base: number;

    @ApiProperty({
        description: 'Sale price',
        example: 900000,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    sale?: number;

    @ApiProperty({
        description: 'Special price',
        example: 800000,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    special?: number;
}

export class ImageDTO implements ImageSchema {
    constructor(data: ImageSchema) {
        this.url = data.url;
        this.publicId = data.publicId;
        this.isThumbnail = data.isThumbnail ?? false;
    }

    @ApiProperty({
        description: 'Image url',
        example: 'https://cdn.techcell.cloud/xxxxx',
    })
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiProperty({
        description: 'Image public id',
        example: 'Techcell/xxxxx',
    })
    @IsString()
    @IsNotEmpty()
    publicId: string;

    @ApiProperty({
        description: 'Is this image is thumbnail',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => isTrueSet(value))
    isThumbnail?: boolean;
}

export class VariationDTO implements VariationSchema {
    @ApiProperty({
        description: 'SKU of product',
        example: 'IPHONE-12-128GB',
    })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({
        description: 'Attributes of product',
        type: [AttributeDTO],
        example: [
            {
                k: 'color',
                v: 'Black',
            },
            {
                k: 'ram',
                v: '8',
                u: 'GB',
            },
        ],
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    attributes: Array<AttributeDTO>;

    @ApiProperty({
        description: 'Price of product',
        type: PriceDTO,
    })
    price: PriceDTO;

    @ApiProperty({
        description: 'Stock of product',
        example: 100,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(9000000)
    stock: number;

    @ApiProperty({
        description: 'Images of variation',
        type: [ImageDTO],
    })
    @IsArray()
    @Type(() => ImageDTO)
    images: ImageDTO[];

    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: number;
}

export class CreateProductDTO {
    constructor(data: CreateProductRequestDTO) {
        this.name = data.name;
        this.description = data.description;
        this.category = new Types.ObjectId(data.category._id);
        this.status = data.status;
        this.generalAttributes = data.generalAttributes;
        this.generalImages = [];
        this.variations = [];
        this.descriptionImages = [];
    }

    @ApiProperty({
        description: 'Name of product',
        example: 'Iphone 12',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Description of product, can be html, rich text',
        example: 'Iphone 12 128GB',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        type: String,
        description: 'Category of product',
        example: '60f9f7b8c7b2c7b7f4a4b5b3',
    })
    @IsMongoId()
    @IsNotEmpty()
    category: Types.ObjectId;

    @ApiProperty({
        description: 'Status of product',
        example: ProductStatus.OnSales,
    })
    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: number;

    @ApiProperty({
        description: 'General attributes of product',
        type: [AttributeDTO],
    })
    @IsArray()
    @IsOptional()
    generalAttributes: Array<AttributeDTO>;

    @IsArray()
    @IsOptional()
    generalImages: ImageDTO[];

    @IsArray()
    @IsNotEmpty()
    descriptionImages: ImageDTO[];

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationDTO)
    variations: VariationDTO[];
}
