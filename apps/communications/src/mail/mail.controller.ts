import { Controller, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { Ctx, Payload, RmqContext, EventPattern } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { MailEventPattern } from './mail.pattern';
import { RESEND_TRANSPORT, SENDGRID_TRANSPORT } from './constants';

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
        {
            email,
            emailContext,
            transporter = SENDGRID_TRANSPORT,
        }: { email: string; emailContext: ConfirmEmailRegisterDTO; transporter?: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendConfirmMail(email, emailContext, transporter);
    }

    @EventPattern(MailEventPattern.sendMailForgotPassword)
    async sendForgotPasswordEmail(
        @Ctx() context: RmqContext,
        @Payload()
        {
            userEmail,
            firstName,
            otpCode,
            transporter = RESEND_TRANSPORT,
        }: ForgotPasswordEmailDTO & {
            transporter?: string;
        },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendForgotPasswordMail(
            {
                userEmail,
                firstName,
                otpCode,
            },
            transporter,
        );
    }
}
