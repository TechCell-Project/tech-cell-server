import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProductDataDTO {
    @ApiProperty({
        description: 'Product data in JSON format (stringified)',
        type: 'string',
    })
    @IsString()
    @IsNotEmpty()
    productData: string;
}
