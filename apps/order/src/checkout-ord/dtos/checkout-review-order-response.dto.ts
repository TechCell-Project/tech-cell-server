import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ReviewOrderRequestDTO } from './checkout-review-order-request.dto';
import { IsNumberI18n } from '~libs/common/i18n';

export class ReviewOrderResponseDTO extends IntersectionType(ReviewOrderRequestDTO) {
    constructor(data: ReviewOrderResponseDTO) {
        super(data);
        this.addressSelected = data.addressSelected;
        this.productSelected = data.productSelected;
        this.totalShipping = data.totalShipping;
        this.totalOrder = data.totalOrder;
    }

    @ApiProperty({
        description: 'Total shipping fee',
        example: 20000,
    })
    @IsNumberI18n()
    totalShipping: number;

    @ApiProperty({
        description: 'Total order',
        example: 20000000,
    })
    @IsNumberI18n()
    totalOrder: number;
}
