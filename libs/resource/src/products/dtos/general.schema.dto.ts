import { ApiProperty } from '@nestjs/swagger';
import { Category, Manufacturer } from '../enums';

class AttributesSchemaDto {
    @ApiProperty({
        description: 'The attribute key',
        example: 'k: "Storage"',
    })
    k: string;

    @ApiProperty({
        description: 'The attribute value',
        example: 'v: "512"',
    })
    v: number | string;

    @ApiProperty({
        description: 'The unit of attribute',
        example: 'u: "GB"',
    })
    u?: string;
}

export class ImageSchemaDto {
    @ApiProperty({
        description: 'File name',
    })
    file_name: string;

    @ApiProperty({
        description: 'Image URL',
        example:
            'https://res.cloudinary.com/doij577wy/image/upload/v1683643826/GearFun/avatar1683643825087.webp',
    })
    path: string;

    @ApiProperty({
        description: 'Public_id of the image return by cloudinary',
        example: 'u: "GB"',
    })
    cloudinary_id: string;

    @ApiProperty({
        description: 'The time the file was uploaded',
        example: '2023-07-20T019:11:45.031Z',
    })
    date_modified: Date;
}

export class GeneralSchemaDto {
    @ApiProperty({ description: "Product's name", example: 'Samsung Galaxy S23 Ultra 256GB' })
    name: string;

    @ApiProperty({
        description: 'contains product attributes',
        type: [AttributesSchemaDto],
    })
    attributes?: AttributesSchemaDto[];

    @ApiProperty({ description: "Product's sku", example: 'samsung-galaxy-s23-ultra-256gb' })
    sku?: string;

    @ApiProperty({ description: 'The manufacturer', example: 'Samsung' })
    manufacturer?: Manufacturer;

    @ApiProperty({ description: 'Array containing data of product images', type: [ImageSchemaDto] })
    images?: ImageSchemaDto[];

    @ApiProperty({ description: 'The category', example: 'Android' })
    categories?: Category;
}
