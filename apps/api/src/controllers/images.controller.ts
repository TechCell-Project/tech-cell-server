import { AdminGuard, catchException } from '~libs/common';
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
    UploadedFiles,
    Req,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiPayloadTooLargeResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ImageUploadedResponseDTO } from '~apps/managements/images-mnt/dtos/image-uploaded-response.dto';
import { PublicIdDTO } from '~apps/managements/images-mnt/dtos/publicId.dto';
import { ImagesMntMessagePattern } from '~apps/managements/images-mnt/images-mnt.pattern';
import {
    ACCESS_TOKEN_NAME,
    ARRAY_IMAGE_FILE_MAX_COUNT,
    IMAGE_FILE_MAX_SIZE_IN_BYTES,
    IMAGE_FILE_MAX_SIZE_IN_MB,
    SINGLE_IMAGE_FILE_MAX_COUNT,
} from '~libs/common/constants/api.constant';
import { MANAGEMENTS_SERVICE } from '~libs/common/constants/services.constant';
import { Request } from 'express';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@ApiTags('images')
@Controller('images')
export class ImagesController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    static buildUploadImageUrl(req: Request, filename: string) {
        return `${req.protocol}://${req.headers.host}/public/${filename}`;
    }

    @ApiOperation({
        summary: 'Get image by public id',
    })
    @ApiOkResponse({
        description: 'Image found',
        type: ImageUploadedResponseDTO,
    })
    @ApiNotFoundResponse({
        description: 'Image not found',
    })
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
        description: `Image size too large, maximum 10 MB, and maximum ${SINGLE_IMAGE_FILE_MAX_COUNT} image`,
    })
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                files: SINGLE_IMAGE_FILE_MAX_COUNT,
                fileSize: IMAGE_FILE_MAX_SIZE_IN_BYTES,
            },
            fileFilter: (req, file, cb) => {
                if (!RegExp(/\.(jpg|jpeg|png|gif|webp)$/).exec(file.originalname)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                if (file.size > IMAGE_FILE_MAX_SIZE_IN_BYTES) {
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
                    description: `Maximum image size is ${IMAGE_FILE_MAX_SIZE_IN_MB} MB (${IMAGE_FILE_MAX_SIZE_IN_BYTES} bytes)`,
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
                    new MaxFileSizeValidator({ maxSize: IMAGE_FILE_MAX_SIZE_IN_BYTES }),
                    new FileTypeValidator({
                        fileType: 'image',
                    }),
                ],
                fileIsRequired: true,
            }),
        )
        image: Express.Multer.File,
        @Req() req: Request,
    ) {
        const imageUrl = ImagesController.buildUploadImageUrl(req, image.filename);
        return this.managementsService
            .send(ImagesMntMessagePattern.uploadSingleImage, { image, imageUrl })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Upload array of image',
    })
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({
        description: 'Images uploaded',
        type: [ImageUploadedResponseDTO],
    })
    @ApiPayloadTooLargeResponse({
        description: `Image size too large, maximum ${IMAGE_FILE_MAX_SIZE_IN_MB} MB, and maximum ${ARRAY_IMAGE_FILE_MAX_COUNT} images`,
    })
    @ApiBody({
        description: 'Image files to upload as multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                        description: `Maximum image size is ${IMAGE_FILE_MAX_SIZE_IN_MB} MB (${IMAGE_FILE_MAX_SIZE_IN_BYTES} bytes)`,
                    },
                },
            },
        },
    })
    @UseInterceptors(
        FilesInterceptor('images', ARRAY_IMAGE_FILE_MAX_COUNT, {
            limits: {
                files: ARRAY_IMAGE_FILE_MAX_COUNT,
                fileSize: IMAGE_FILE_MAX_SIZE_IN_BYTES,
            },
            fileFilter: (req, file, cb) => {
                if (!RegExp(/\.(jpg|jpeg|png|gif|webp)$/).exec(file.originalname)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                if (file.size > IMAGE_FILE_MAX_SIZE_IN_BYTES) {
                    return cb(new PayloadTooLargeException('Image size too large'), false);
                }
                cb(null, true);
            },
        }),
    )
    @Post('/array')
    @UseGuards(AdminGuard)
    async uploadArrayImages(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: IMAGE_FILE_MAX_SIZE_IN_BYTES }),
                    new FileTypeValidator({
                        fileType: 'image',
                    }),
                ],
                fileIsRequired: true,
            }),
        )
        images: Express.Multer.File[],
        @Req() req: Request,
    ) {
        const imageUrls = images.map((image) =>
            ImagesController.buildUploadImageUrl(req, image.filename),
        );
        return this.managementsService
            .send(ImagesMntMessagePattern.uploadArrayImage, { images, imageUrls })
            .pipe(catchException());
    }
}
