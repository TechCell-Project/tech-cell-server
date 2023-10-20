import { Types } from 'mongoose';
import { AttributeSchema, ImageSchema, PriceSchema, Product, VariationSchema } from '../schemas';
import { ProductStatus } from '../enums/ProductStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AttributeDTO implements AttributeSchema {
    @ApiProperty({
        description: 'Key of the attribute',
        type: String,
        example: 'ram',
    })
    k: string;

    @ApiProperty({
        description: 'Value of the attribute',
        type: String,
        example: '16',
    })
    v: string;

    @ApiProperty({
        description: 'Unit of the attribute',
        type: String,
        required: false,
        example: 'gb',
    })
    u?: string;
}

export class ImageDTO implements ImageSchema {
    @ApiProperty({
        description: 'Public Id of the image',
        type: String,
    })
    publicId: string;

    @ApiProperty({
        description: 'Url of image',
        type: String,
        format: 'url',
    })
    url: string;

    @ApiProperty({
        description: 'Is image thumbnail?',
        type: Boolean,
        example: false,
        required: false,
    })
    isThumbnail?: boolean;
}

export class PriceDTO implements PriceSchema {
    @ApiProperty({
        description: 'The base price',
        example: 1299999,
        type: Number,
    })
    base: number;

    @ApiProperty({
        description: 'The sale off price',
        example: 11899000,
        type: Number,
        required: false,
    })
    saleOff?: number;

    @ApiProperty({
        description: 'The special price',
        example: 10899000,
        type: Number,
        required: false,
    })
    special?: number;
}

export class VariationDTO implements VariationSchema {
    @ApiProperty({
        description: 'The unique sku of product variation',
        example: 'Apple_Iphone_14_black_16ram',
    })
    sku: string;

    @ApiProperty({
        description: "Attributes of product's variations",
        type: [AttributeDTO],
    })
    attributes: AttributeDTO[];

    @ApiProperty({
        description: 'Price of product',
        type: PriceDTO,
    })
    price: PriceDTO;

    @ApiProperty({
        description: 'Number of stock',
    })
    stock: number;

    @ApiProperty({
        description: "Image of product's variations",
        type: [ImageDTO],
    })
    images: ImageDTO[];

    @ApiProperty({
        description: 'Status of product',
        type: Number,
        enum: ProductStatus,
        example: ProductStatus.OnSales,
    })
    status?: number;
}

export class ProductDTO implements Product {
    @ApiProperty({
        description: 'ObjectId of product',
        type: String,
        format: 'ObjectId',
        example: '5f9d88f0d6e6d1f0e8f8c0c2',
    })
    _id: Types.ObjectId;

    @ApiProperty({
        description: 'Name of product',
        example: 'iPhone 15',
    })
    name: string;

    @ApiProperty({
        description: 'Description of product',
        example: 'This is the description of product',
    })
    description: string;

    @ApiProperty({
        description: 'ObjectId of category',
        example: '5f9d88f0d6e6d1f0e8f8c0c2',
        type: String,
        format: 'ObjectId',
    })
    category: Types.ObjectId;

    @ApiProperty({
        description: 'Status of product',
        type: Number,
        enum: ProductStatus,
        example: ProductStatus.OnSales,
    })
    status?: number;

    @ApiProperty({
        description: 'General attributes of product',
        type: AttributeDTO,
    })
    generalAttributes: AttributeDTO[];

    @ApiProperty({
        description: 'General images of product',
        type: [ImageDTO],
    })
    generalImages: ImageDTO[];

    @ApiProperty({
        description: 'Description images of product',
        type: [ImageDTO],
    })
    descriptionImages: ImageDTO[];

    @ApiProperty({
        description: 'Variations of product',
        type: [VariationDTO],
    })
    variations: VariationDTO[];
}
