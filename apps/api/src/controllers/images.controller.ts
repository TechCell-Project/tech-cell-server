import { AdminGuard, catchException } from '@app/common';
import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    Get,
    Inject,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    PayloadTooLargeException,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiPayloadTooLargeResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ImageUploadedResponseDTO } from '~/apps/managements/images-mnt/dtos/image-uploaded-response.dto';
import { PublicIdDTO } from '~/apps/managements/images-mnt/dtos/publicId.dto';
import { ImagesMntMessagePattern } from '~/apps/managements/images-mnt/images-mnt.pattern';
import { MANAGEMENTS_SERVICE } from '~/constants/services.constant';

@ApiBadRequestResponse({
    description: 'Invalid request',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error',
})
@ApiBearerAuth('accessToken')
@ApiTags('images')
@Controller('images')
export class ImagesController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @Get('/:publicId')
    async getImageByPublicId(@Param() { publicId }: PublicIdDTO) {
        return this.managementsService
            .send(ImagesMntMessagePattern.getImageByPublicId, { publicId })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Upload image',
    })
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({
        description: 'Image uploaded',
        type: ImageUploadedResponseDTO,
    })
    @ApiPayloadTooLargeResponse({
        description: 'Image size too large, maximum 10 MB',
    })
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                files: 1,
                fileSize: 1024 * 1024 * 10, // default 10 MB
            },
            fileFilter: (req, file, cb) => {
                if (!RegExp(/\.(jpg|jpeg|png|gif|webp)$/).exec(file.originalname)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                if (file.size > 1024 * 1024 * 10) {
                    return cb(new PayloadTooLargeException('Image size too large'), false);
                }
                cb(null, true);
            },
        }),
    )
    @ApiBody({
        description: 'Image file to upload as multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Maximum image size is 10 MB (10,485,760 bytes)',
                },
            },
        },
    })
    @Post('/')
    @UseGuards(AdminGuard)
    async uploadSingleImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
                    new FileTypeValidator({
                        fileType: 'image',
                    }),
                ],
                fileIsRequired: true,
            }),
        )
        image: Express.Multer.File,
    ) {
        return this.managementsService
            .send(ImagesMntMessagePattern.uploadSingleImage, { image })
            .pipe(catchException());
    }
}
