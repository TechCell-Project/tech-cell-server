import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '~libs/common';
import { OtpService } from './otp.service';
import { OtpRepository } from './otp.repository';
import { Otp, OtpSchema } from './otp.schema';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    ],
    controllers: [],
    providers: [OtpService, OtpRepository],
    exports: [OtpService],
})
export class OtpModule {}
