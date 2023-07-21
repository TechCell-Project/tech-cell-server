import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { GeneralSchemaDto } from './general.schema.dto';
import { FilterableSchemaDto } from './filterable.schema.dto';
import { Review_StatsSchemaDto } from './review-stat.schema.dto';
import { ProductStatus } from '../enums';

export class ProductsMntResponseDto {
    @ApiProperty({
        description: 'The product id',
        type: String,
        example: '6493c67dc0ab97f5eb2beca5',
    })
    _id: string | Types.ObjectId;

    @ApiProperty({ description: 'Contains general product information', type: GeneralSchemaDto })
    general: GeneralSchemaDto;

    @ApiProperty({
        description: 'Contains information specific to product filtering',
        type: FilterableSchemaDto,
    })
    filterable: FilterableSchemaDto;

    @ApiProperty({
        description: 'Contains information specific to product filtering',
        type: FilterableSchemaDto,
    })
    review_stats: Review_StatsSchemaDto;

    @ApiProperty({ description: 'The user role', example: ProductStatus.ComingSoon })
    status: number;

    @ApiProperty({
        description: 'The product created date',
        example: '2023-07-20T019:11:45.031Z',
    })
    createdAt?: Date;

    @ApiProperty({ description: 'The product updated date', example: '2023-07-20T019:11:45.031Z' })
    updatedAt?: Date;
}
