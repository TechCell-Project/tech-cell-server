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
import { ProductStatus } from '@app/resource/products/enums';
import { ApiProperty } from '@nestjs/swagger';

export class PriceDTO {
    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Base price of product',
        example: 1000000,
    })
    @IsNumber()
    @IsNotEmpty()
    base: number;

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Sale price of product',
        example: 900000,
    })
    @IsNumber()
    @IsOptional()
    sale?: number;

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Special price of product',
        example: 800000,
    })
    @IsNumber()
    @IsOptional()
    special?: number;
}

export class AttributeDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Key of attribute',
        example: 'ram',
    })
    @IsString()
    @IsNotEmpty()
    k: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Value of attribute',
        example: '8',
    })
    @IsString()
    @IsNotEmpty()
    v: string;

    @ApiProperty({
        type: String,
        required: false,
        description: 'Unit of attribute',
        example: 'gb',
    })
    @IsString()
    u?: string;
}

export class VariationDTO {
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
    attributes: Array<AttributeDTO>;

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
    price: PriceDTO;

    // @ApiProperty({
    //     type: Array<Express.Multer.File>,
    //     required: true,
    //     description: 'Files of image product',
    // })
    // files: Array<Express.Multer.File>;
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
        type: String,
        required: true,
        description: 'Brand of product',
        example: 'Apple',
    })
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Categories of product',
        example: ['iphone'],
    })
    @IsArray()
    @IsNotEmpty()
    categories: string[];

    // @ApiProperty({
    //     type: 'number',
    //     enum: ProductStatus,
    //     required: false,
    //     description: 'Status of product',
    // })
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
    generalAttributes: Array<AttributeDTO>;

    @ApiProperty({
        type: [VariationDTO],
        required: true,
        description: 'Variations of product',
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationDTO)
    variations: VariationDTO[];

    // @ApiProperty({ type: String, format: 'binary', required: true })
    // files: Express.Multer.File[];
}
