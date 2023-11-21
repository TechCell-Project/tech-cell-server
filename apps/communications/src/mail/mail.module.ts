import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './mail.config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    controllers: [MailController],
    providers: [MailService, RabbitMQService],
})
export class MailModule {}
