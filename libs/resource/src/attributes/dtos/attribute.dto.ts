import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../schemas';
import { Types } from 'mongoose';

export class AttributeDTO implements Attribute {
    @ApiProperty({
        type: String,
        description: 'Attribute id',
        example: '60f7b0f6c2e6a9b3e8b4e3d2',
        format: 'ObjectId',
    })
    _id: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: 'Attribute name',
        example: 'bộ nhớ',
    })
    name: string;

    @ApiProperty({
        type: String,
        description: 'Attribute label',
        example: 'storage',
        uniqueItems: true,
    })
    label: string;

    @ApiProperty({
        type: String,
        description: 'Attribute description',
        example: 'Bộ nhớ của sản phẩm',
    })
    description: string;
    isDeleted?: boolean;
}
