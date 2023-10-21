import { Controller, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { Ctx, Payload, RmqContext, EventPattern } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { MailEventPattern } from './mail.pattern';

@Controller()
export class MailController {
    constructor(
        private readonly mailService: MailService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @EventPattern(MailEventPattern.sendMailConfirm)
    async sendConfirmEmail(
        @Ctx() context: RmqContext,
        @Payload()
        { email, emailContext }: { email: string; emailContext: ConfirmEmailRegisterDTO },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendConfirmMail(email, emailContext);
    }

    @EventPattern(MailEventPattern.sendMailForgotPassword)
    async sendForgotPasswordEmail(
        @Ctx() context: RmqContext,
        @Payload() { userEmail, firstName, otpCode }: ForgotPasswordEmailDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendForgotPasswordMail({
            userEmail,
            firstName,
            otpCode,
        });
    }
}
