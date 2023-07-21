import { ApiProperty } from '@nestjs/swagger';

export class Review_StatsSchemaDto {
    @ApiProperty({
        description: 'Average rating of the product',
        example: '4.5',
    })
    average_rating: number;

    @ApiProperty({
        description: 'total product reviews',
        example: '30',
    })
    review_count: number;
}
