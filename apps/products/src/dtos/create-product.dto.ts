import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(900000000)
    price: number;

    @IsOptional()
    @IsString()
    desc: string;
}
