import { ApiProperty } from '@nestjs/swagger';
import { Product } from './../schemas';

export class SearchProductResponseDTO {
    @ApiProperty({ type: [Product] })
    products: Product[];
}
