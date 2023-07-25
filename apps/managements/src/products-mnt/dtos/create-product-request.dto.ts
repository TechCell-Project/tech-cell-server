import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEnum,
    Length,
    Min,
    Max,
    IsArray,
    ArrayMinSize,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Category, Manufacturer, ProductStatus } from '@app/resource/products/enums';
import { AttributesDto, FilterDto, ImageDto } from '@app/resource/products/dtos';

export class CreateProductRequestDto {
    @ApiProperty({
        description: "Product's name",
        example: 'Samsung Galaxy S23 Ultra',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Length(10)
    name: string;

    @ApiProperty({
        description: 'Contains product attributes',
        type: [AttributesDto],
        required: true,
    })
    @ValidateNested({ each: true })
    @Type(() => AttributesDto)
    attributes: AttributesDto[];

    @ApiProperty({ description: 'The manufacturer', example: 'Samsung', required: true })
    @IsNotEmpty()
    @IsEnum(Manufacturer)
    manufacturer: Manufacturer;

    @ApiProperty({
        description: 'Array containing data of product images',
        type: [ImageDto],
        required: false,
    })
    @IsArray()
    @ArrayMinSize(4)
    images?: ImageDto[];

    @ApiProperty({ description: 'The category', example: 'Android', required: true })
    @IsNotEmpty()
    @IsEnum(Category)
    categories: Category;

    @ApiProperty({ description: 'Total products in stock', example: '3423', required: true })
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    @Max(999999)
    stock: number;

    @ApiProperty({ description: 'The product filter', type: [FilterDto], required: true })
    @ValidateNested({ each: true })
    @Type(() => FilterDto)
    filter: FilterDto[];

    @ApiProperty({ description: 'The product price', example: '29990000', required: true })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    price: number;

    @ApiProperty({
        description: 'Special price of the product',
        example: '27990000',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(100000000)
    special_price: number;

    @ApiProperty({ description: 'The product thumbnail', type: ImageDto, required: false })
    thumbnail?: ImageDto;

    @ApiProperty({ description: 'The product status', example: 1, required: true })
    @IsNotEmpty()
    @Type(() => Number)
    @IsEnum(ProductStatus)
    status: number;

    // @ApiProperty({
    //     description: 'Store uploaded photos, minimum 5 photos required',
    //     required: true,
    // })
    // @IsNotEmpty()
    // @ArrayMinSize(5)
    // files: Express.Multer.File[];
}
