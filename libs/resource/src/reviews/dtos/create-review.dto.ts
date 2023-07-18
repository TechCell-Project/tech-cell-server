import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProductReviewDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    rating: number;

    @IsString()
    comment: string;
}
