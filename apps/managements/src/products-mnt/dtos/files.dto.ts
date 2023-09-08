import { ApiProperty } from '@nestjs/swagger';

export class FilesDTO {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    files: Express.Multer.File[];
}
