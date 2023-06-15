import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { RabbitMQModule } from '@app/common';

@Module({
    imports: [RabbitMQModule],
    controllers: [MailController],
    providers: [MailService],
})
export class MailModule {}
