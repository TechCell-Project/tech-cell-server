import { CloudinaryResponse } from '~libs/third-party/cloudinary.com/cloudinary-response';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class ImageUploadedResponseDTO {
    constructor({ public_id, secure_url }: CloudinaryResponse) {
        this.publicId = public_id;
        this.url = secure_url;
    }

    @ApiProperty({
        description: 'Image public id',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    publicId: string;

    @ApiProperty({
        description: 'Image url',
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    url: string;
}
