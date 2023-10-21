import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { AppConfigModule } from '@app/common';

@Module({
    imports: [AppConfigModule, MailModule],
})
export class CommunicationsModule {}
