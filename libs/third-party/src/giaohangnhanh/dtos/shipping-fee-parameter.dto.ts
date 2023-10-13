import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { DeliverOptionEnum, TransportEnum } from '../enums';
import { Type } from 'class-transformer';

/**
 * @see https://docs.giaohangtietkiem.vn/#t-nh-ph-v-n-chuy-n
 */
export class ShippingFeeParametersDTO {
    @IsOptional()
    @IsString()
    pick_address_id: string;

    @IsOptional()
    @IsString()
    pick_address: string;

    @IsNotEmpty()
    @IsString()
    pick_province: string;

    @IsNotEmpty()
    @IsString()
    pick_district: string;

    @IsOptional()
    @IsString()
    pick_ward?: string;

    @IsOptional()
    @IsString()
    pick_street?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsNotEmpty()
    @IsString()
    province: string;

    @IsNotEmpty()
    @IsString()
    district: string;

    @IsOptional()
    @IsString()
    ward?: string;

    @IsOptional()
    @IsString()
    street?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    weight: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    value?: number;

    @IsOptional()
    @IsEnum(TransportEnum)
    transport?: string;

    @IsNotEmpty()
    @IsEnum(DeliverOptionEnum)
    deliver_option: string;

    @IsOptional()
    @IsString()
    tags?: string;
}
