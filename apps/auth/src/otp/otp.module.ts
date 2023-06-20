import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '@app/common';
import { OtpService } from './otp.service';
import { OtpRepository } from './otp.repository';
import { Otp, OtpSchema } from './otp.schema';

@Module({
    imports: [MongodbModule, MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
    controllers: [],
    providers: [OtpService, OtpRepository],
    exports: [OtpService],
})
export class OtpModule {}
