import { Controller, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { MailMessagePattern } from './mail.pattern';

@Controller()
export class MailController {
    constructor(
        private readonly mailService: MailService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern(MailMessagePattern.sendMailConfirm)
    async sendConfirmEmail(
        @Ctx() context: RmqContext,
        @Payload()
        { email, emailContext }: { email: string; emailContext: ConfirmEmailRegisterDTO },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendConfirmMail(email, emailContext);
    }

    @MessagePattern(MailMessagePattern.sendMailForgotPassword)
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
