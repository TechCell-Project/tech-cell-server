import { ApiProperty } from '@nestjs/swagger';
import { ImageSchemaDto } from './general.schema.dto';

class FilterSchemaDto {
    @ApiProperty({
        description: 'The filter id',
        example: 'manufacturer',
    })
    id: string;

    @ApiProperty({
        description: 'The filter label',
        example: 'Samsung',
    })
    Label: string;
}

export class FilterableSchemaDto {
    @ApiProperty({ description: 'Total products in stock', example: '3423' })
    stock?: number;

    @ApiProperty({ description: 'The product filter', type: [FilterSchemaDto] })
    filter: FilterSchemaDto[];

    @ApiProperty({ description: 'The product price', example: '29990000' })
    price: number;

    @ApiProperty({ description: 'Special price of the product', example: '27990000' })
    special_price: number;

    @ApiProperty({ description: 'The product thumbnail', type: ImageSchemaDto })
    thumbnail: ImageSchemaDto;
}
