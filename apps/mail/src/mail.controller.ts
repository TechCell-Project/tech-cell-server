import { Controller, Inject, Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

@Controller()
export class MailController {
    constructor(
        private readonly mailService: MailService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern({ cmd: 'mail_send_confirm' })
    async sendConfirmEmail(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return 'mail_send_confirm';
    }
}
