import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer/interceptors/any-files.interceptor';

export const ValidateImageFileInterceptor = (fileNums = 30, fileSize = 1024 * 1024 * 10) =>
    UseInterceptors(
        AnyFilesInterceptor({
            limits: {
                files: fileNums,
                fileSize: fileSize, // default 10 MB
            },
            fileFilter: (req, file, cb) => {
                if (!RegExp(/\.(jpg|jpeg|png|gif|webp)$/).exec(file.originalname)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
        }),
    );
