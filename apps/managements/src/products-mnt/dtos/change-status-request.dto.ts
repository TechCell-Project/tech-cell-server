import { IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ProductStatus } from '@app/resource/products/enums';

export class ChangeStatusRequestDTO {
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    @IsNumber()
    status: number;
}
