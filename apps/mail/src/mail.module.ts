import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { RabbitMQModule } from '@app/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './mail.config';

@Module({
    imports: [
        RabbitMQModule,
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    controllers: [MailController],
    providers: [MailService],
})
export class MailModule {}
