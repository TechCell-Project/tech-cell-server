import { CloudinaryResponse } from '~libs/third-party/cloudinary.com/cloudinary-response';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImageUploadedResponseDTO {
    constructor({ public_id, secure_url }: CloudinaryResponse) {
        this.publicId = public_id;
        this.url = secure_url;
    }

    @ApiProperty({
        description: 'Image public id',
    })
    @IsString()
    @IsNotEmpty()
    publicId: string;

    @ApiProperty({
        description: 'Image url',
    })
    @IsString()
    @IsNotEmpty()
    url: string;
}
