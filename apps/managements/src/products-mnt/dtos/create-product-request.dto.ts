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

class VariationDTO {
    @ApiProperty({
        type: Array<AttributeDTO>,
        required: true,
        description: 'Attributes of product',
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    attributes: Array<AttributeDTO>;

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'Stock of product',
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
    })
    price: PriceDTO;

    @ApiProperty({
        type: Array<Express.Multer.File>,
        required: true,
        description: 'Files of image product',
    })
    files: Array<Express.Multer.File>;
}

export class CreateProductRequestDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'Name of product',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Description of product',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Brand of product',
    })
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiProperty({
        type: String,
        required: true,
        description: 'Categories of product',
    })
    @IsArray()
    @IsNotEmpty()
    categories: string[];

    @ApiProperty({
        type: 'number',
        enum: ProductStatus,
        required: true,
        description: 'Status of product',
    })
    @IsNumber()
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    status: number;

    @ApiProperty({
        type: Array<AttributeDTO>,
        required: false,
        description: 'General attributes of product',
    })
    @IsArray()
    @IsOptional()
    generalAttributes: Array<AttributeDTO>;

    @ApiProperty({
        type: Array<VariationDTO>,
        required: true,
        description: 'Variations of product',
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VariationDTO)
    variations: VariationDTO[];

    @ApiProperty({ type: String, format: 'binary', required: true })
    files: Express.Multer.File[];
}
