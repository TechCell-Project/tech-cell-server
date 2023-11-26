import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer/interceptors/any-files.interceptor';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/generated/i18n.generated';

export const ValidateImageFileInterceptor = (fileNums = 30, fileSize = 1024 * 1024 * 10) =>
    UseInterceptors(
        AnyFilesInterceptor({
            limits: {
                files: fileNums,
                fileSize: fileSize, // default 10 MB
            },
            fileFilter: (req, file, cb) => {
                if (!RegExp(/\.(jpg|jpeg|png|gif|webp)$/).exec(file.originalname)) {
                    return cb(
                        new BadRequestException(
                            I18nContext.current<I18nTranslations>().t(
                                'errorMessage.ONLY_IMAGE_FILE_IS_ACCEPTED',
                            ),
                        ),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    );
