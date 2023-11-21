import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ReviewOrderRequestDTO } from './checkout-review-order-request.dto';
import { IsNumber } from 'class-validator';

export class ReviewOrderResponseDTO extends IntersectionType(ReviewOrderRequestDTO) {
    constructor(data: ReviewOrderResponseDTO) {
        super(data);
        this.addressSelected = super.addressSelected;
        this.productSelected = super.productSelected;
        this.totalShipping = data.totalShipping;
        this.totalOrder = data.totalOrder;
    }

    @ApiProperty({
        description: 'Total shipping fee',
        example: 20000,
    })
    @IsNumber()
    totalShipping: number;

    @ApiProperty({
        description: 'Total order',
        example: 20000000,
    })
    @IsNumber()
    totalOrder: number;
}
