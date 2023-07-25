import { IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@app/resource/products/enums';

export class ChangeStatusRequestDTO {
    @ApiProperty({
        description: 'Product status',
        example: 1,
        type: 'number',
        enum: ProductStatus,
    })
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    @IsNumber()
    status: number;
}
