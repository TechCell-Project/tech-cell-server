import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ImageAction } from '../enums/image-action.enum';

class ImageUpdateDTO {
    @ApiProperty({
        type: 'string',
        enum: ImageAction,
        required: false,
    })
    @IsString()
    @IsOptional()
    action?: string;

    @ApiProperty({
        type: 'string',
        required: false,
    })
    @IsString()
    @IsOptional()
    publicId?: string;
}

export class UpdateProductGeneralImagesDTO {
    @ApiProperty({
        type: [ImageUpdateDTO],
        required: false,
    })
    images: ImageUpdateDTO[];
}
