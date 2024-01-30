import { Controller, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Ctx, Payload, RmqContext, EventPattern } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { MailEventPattern } from './mail.pattern';
import { SENDGRID_TRANSPORT } from './constants';
import { SupportedLanguage } from '~libs/common/i18n';

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
            lang,
        }: {
            email: string;
            emailContext: ConfirmEmailRegisterDTO;
            transporter?: string;
            lang: SupportedLanguage;
        },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendConfirmMail(email, emailContext, lang, transporter);
    }

    @EventPattern(MailEventPattern.sendMailForgotPassword)
    async sendForgotPasswordEmail(
        @Ctx() context: RmqContext,
        @Payload()
        {
            userEmail,
            firstName,
            otpCode,
            transporter = SENDGRID_TRANSPORT,
            lang,
        }: ForgotPasswordEmailDTO & {
            transporter?: string;
            lang: SupportedLanguage;
        },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.mailService.sendForgotPasswordMail(
            {
                userEmail,
                firstName,
                otpCode,
            },
            lang,
            transporter,
        );
    }
}
