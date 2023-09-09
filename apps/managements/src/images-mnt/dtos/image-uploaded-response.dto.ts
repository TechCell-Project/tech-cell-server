import { CloudinaryResponse } from '@app/common/Cloudinary/cloudinary-response';
import { ApiProperty } from '@nestjs/swagger';

export class ImageUploadedResponseDTO {
    constructor({ public_id, secure_url }: CloudinaryResponse) {
        this.publicId = public_id;
        this.url = secure_url;
    }

    @ApiProperty({
        description: 'Image public id',
    })
    publicId: string;

    @ApiProperty({
        description: 'Image url',
    })
    url: string;
}
