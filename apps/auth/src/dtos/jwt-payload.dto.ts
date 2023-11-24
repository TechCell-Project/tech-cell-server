import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { IsEmailI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class JwtPayloadDto {
    @Type(() => String)
    @IsNotEmptyI18n()
    @IsStringI18n()
    _id: string | Types.ObjectId;

    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;

    @IsStringI18n()
    @IsNotEmptyI18n()
    role: string;
}
