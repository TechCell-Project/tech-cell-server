import { Controller, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO } from './dtos';

@Controller()
export class MailController {
    constructor(
        private readonly mailService: MailService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern({ cmd: 'mail_send_confirm' })
    async sendConfirmEmail(
        @Ctx() context: RmqContext,
        @Payload()
        { email, emailContext }: { email: string; emailContext: ConfirmEmailRegisterDTO },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendConfirmMail(email, emailContext);
    }
}
