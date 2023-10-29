import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications';
import { CommunicationsController } from './communications.controller';

@Module({
    imports: [AppConfigModule, MailModule, NotificationsModule],
    controllers: [CommunicationsController],
})
export class CommunicationsModule {}
