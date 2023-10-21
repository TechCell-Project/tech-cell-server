import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './mail.config';

@Module({
    imports: [
        AppConfigModule,
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    controllers: [MailController],
    providers: [MailService, RabbitMQService],
})
export class MailModule {}
