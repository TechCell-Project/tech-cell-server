import { Category } from '../schemas';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeDTO } from '@app/resource/attributes/dtos';
import { Types } from 'mongoose';

export class CategoryDTO implements Category {
    @ApiProperty({
        type: String,
        description: 'Category id',
        example: '60f7b0f6c2e6a9b3e8b4e3d2',
        format: 'ObjectId',
    })
    _id: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: 'Category name',
        example: 'hệ điều hành',
    })
    name: string;

    @ApiProperty({
        type: String,
        description: 'Category label',
        example: 'ios',
        uniqueItems: true,
    })
    label: string;

    @ApiProperty({
        type: [AttributeDTO],
        description: 'List of attributes',
        example: AttributeDTO,
    })
    requireAttributes: AttributeDTO[];

    @ApiProperty({
        type: String,
        description: 'Category description',
        example: 'Hệ điều hành ios',
    })
    description: string;

    @ApiProperty({
        type: String,
        description: 'Category image url',
        example: 'https://example.com/ios',
        required: false,
    })
    url: string;

    isDeleted?: boolean;
}
