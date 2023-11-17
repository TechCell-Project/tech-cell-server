import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications';
import { CommunicationsController } from './communications.controller';
import { CommunicationsHealthIndicator } from './communications.health';
import { RabbitMQModule } from '~libs/common/RabbitMQ';

@Module({
    imports: [AppConfigModule, MailModule, NotificationsModule, RabbitMQModule],
    controllers: [CommunicationsController],
    providers: [CommunicationsHealthIndicator],
})
export class CommunicationsModule {}
