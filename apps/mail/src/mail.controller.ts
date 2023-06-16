import { Controller, Inject, Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class MailController {
    constructor(
        private readonly mailService: MailService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern({ cmd: 'mail_send_confirm' })
    async sendConfirmEmail(
        @Ctx() context: RmqContext,
        @Payload() { email, message }: { email: string; message: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendMail(email, message);
    }
}
