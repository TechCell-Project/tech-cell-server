import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CategoryIdParam {
    @ApiProperty({ type: String, description: 'Category id', example: '5f9d4e4b9d6b2e1f7c7b3b4a' })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid category id' })
    categoryId: string | Types.ObjectId;
}
