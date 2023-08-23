import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { AppConfigModule, RabbitMQService } from '@app/common';
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
