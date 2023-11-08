import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../schemas';

export class AttributeDTO implements Omit<Attribute, '_id'> {
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
