import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../schemas';
import { Types } from 'mongoose';
import { IsMongoIdI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';
import { IsOptional } from 'class-validator';

export class AttributeDTO implements Attribute {
    @ApiProperty({
        type: String,
        description: 'Attribute id',
        example: '60f7b0f6c2e6a9b3e8b4e3d2',
        format: 'ObjectId',
    })
    @IsMongoIdI18n()
    @IsNotEmptyI18n()
    _id: Types.ObjectId;

    @ApiProperty({
        type: String,
        description: 'Attribute name',
        example: 'bộ nhớ',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    name: string;

    @ApiProperty({
        type: String,
        description: 'Attribute label',
        example: 'storage',
        uniqueItems: true,
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    label: string;

    @ApiProperty({
        type: String,
        description: 'Attribute description',
        example: 'Bộ nhớ của sản phẩm',
    })
    @IsOptional()
    @IsStringI18n()
    description: string;

    @IsOptional()
    isDeleted?: boolean;
}
