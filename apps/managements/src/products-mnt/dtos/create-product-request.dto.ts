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
    IsNotEmptyObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '@app/resource/products/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PriceDTO {
    @ApiProperty({
        type: Number,
        required: true,
        description: 'Base price of product',
        example: 1000000,
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
    })
    @Transform(({ value }) => Number(String(value).replace(/,/g, '')))
    @IsNumber(
        { maxDecimalPlaces: 0 },
        {
            message: 'base must be integer',
        },
    )
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    @IsNotEmpty()
    base: number;

    @ApiProperty({
        type: Number,
        required: true,
        description: 'Sale price of product',
        example: 900000,
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
    })
    @Transform(({ value }) => Number(String(value).replace(/,/g, '')))
    @IsNumber(
        { maxDecimalPlaces: 0 },
        {
            message: 'sale must be integer',
        },
    )
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    @IsOptional()
    sale?: number;

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Special price of product',
        example: 800000,
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
    })
    @IsOptional()
    @Transform(({ value }) => Number(String(value).replace(/,/g, '')))
    @IsNumber(
        { maxDecimalPlaces: 0 },
        {
            message: 'special must be integer',
        },
    )
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    special?: number;
}

export class ImageRequestDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Public id of image',
        example: 'publicId',
    })
    @IsString()
    @IsNotEmpty()
    publicId: string;

    @ApiProperty({
        type: String,
        description: 'Is image thumbnail',
        required: false,
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isThumbnail?: boolean;
}

export class AttributeDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Key of attribute',
        example: 'ram',
    })
    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    k: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Value of attribute',
        example: '8',
    })
    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    v: string;

    @ApiProperty({
        type: String,
        required: false,
        description: 'Unit of attribute',
        example: 'gb',
    })
    @Type(() => String)
    @IsString()
    @IsOptional()
    u?: string;
}

export class VariationRequestDTO {
    @ApiProperty({
        type: [AttributeDTO],
        required: true,
        description: 'Attributes of product',
        example: [
            {
                k: 'color',
                v: 'black',
            },
            {
                k: 'storage',
                v: '256',
                u: 'gb',
            },
        ],
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AttributeDTO)
    attributes: AttributeDTO[];

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Stock of product',
        example: 100,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(9000000)
    stock: number;

    @ApiProperty({
        type: PriceDTO,
        required: true,
        description: 'Price of product',
        example: {
            base: 1000000,
            sale: 900000,
            special: 800000,
        },
    })
    @ValidateNested()
    @Type(() => PriceDTO)
    price: PriceDTO;

    @ApiProperty({
        type: Number,
        enum: Object.entries(ProductStatus).map(([key, value]) => `${key}: ${value}`),
        required: false,
        description: 'Status of product (number)',
        default: ProductStatus.Hide,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: number;

    @ApiProperty({
        type: [ImageRequestDTO],
        required: false,
        description: 'Images of product',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImageRequestDTO)
    images?: ImageRequestDTO[];
}

export class CategoryDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Id of category',
        example: '612f5e4c1f5c3d0012a0f0b4',
    })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid product id' })
    _id: string | Types.ObjectId;
}

export class CreateProductRequestDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Name of product',
        example: 'Iphone 13',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Description of product',
        example:
            'The iPhone 13 and iPhone 13 mini are smartphones designed, developed, and marketed by Apple Inc.',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        type: CategoryDTO,
        required: true,
        description: 'Category of product',
    })
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => CategoryDTO)
    category: CategoryDTO | Types.ObjectId;

    @ApiProperty({
        type: [VariationRequestDTO],
        required: true,
        description: 'Variations of product',
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationRequestDTO)
    variations: VariationRequestDTO[];

    @ApiProperty({
        type: Number,
        enum: Object.entries(ProductStatus).map(([key, value]) => `${key}: ${value}`),
        required: false,
        description: 'Status of product',
        default: ProductStatus.Hide,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: number;

    @ApiProperty({
        type: [AttributeDTO],
        required: false,
        description: 'General attributes of product',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AttributeDTO)
    generalAttributes: AttributeDTO[];

    @ApiProperty({
        type: [ImageRequestDTO],
        required: false,
        description: 'General images of product',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImageRequestDTO)
    generalImages?: ImageRequestDTO[];

    @ApiProperty({
        type: [ImageRequestDTO],
        required: false,
        description: 'Description images of product',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImageRequestDTO)
    descriptionImages?: ImageRequestDTO[];
}
