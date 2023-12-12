import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class ObjectIdParamDTO {
    @ApiProperty({
        description: 'A valid mongodb id',
        example: '5f7c5b3c7e7f7f0012b6b8f5',
        type: String,
        format: 'ObjectId',
    })
    @IsNotEmpty()
    @IsMongoId()
    @Type(() => Types.ObjectId)
    id: Types.ObjectId;
}
