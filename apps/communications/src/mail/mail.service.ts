import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RpcException } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { GMAIL_TRANSPORT, RESEND_TRANSPORT, SENDGRID_TRANSPORT } from './constants';
import { MailerConfig } from './mail.config';
import { join } from 'path';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
        const mailConfig = new MailerConfig();
        this.mailerService.addTransporter(SENDGRID_TRANSPORT, mailConfig.SendGridTransport);
        this.mailerService.addTransporter(RESEND_TRANSPORT, mailConfig.ResendTransport);
        this.mailerService.addTransporter(GMAIL_TRANSPORT, mailConfig.GmailTransport);
    }

    private readonly logger = new Logger(MailService.name);
    private readonly TEMPLATES_PATH = join(__dirname, 'mail/templates');

    async sendMail(email: string, name: string, transporter?: string) {
        return await this.mailerService
            .sendMail({
                transporterName: this.resolveTransporter(transporter),
                to: email,
                subject: 'Greeting from NestJS NodeMailer',
                template: 'test',
                context: {
                    name: name,
                },
            })
            .then(() => {
                this.logger.log(`Mail sent:: ${email}`);
                return {
                    message:
                        'Your registration was successfully, please check your email to verify your registration',
                };
            })
            .catch((error) => {
                throw new RpcException(new BadRequestException(error.message));
            });
    }

    async sendConfirmMail(
        email: string,
        emailContext: ConfirmEmailRegisterDTO,
        transporter?: string,
    ) {
        const message = `Mail sent: ${email}`;
        return await this.mailerService
            .sendMail({
                transporterName: this.resolveTransporter(transporter),
                to: email,
                subject: 'Confirm your registration',
                template: 'confirm-register',
                context: emailContext,
            })
            .then(() => {
                this.logger.log(`Mail sent: ${email}`);
                return {
                    message: message,
                };
            })
            .catch((error) => {
                this.logger.error(`Send mail failed: ${error.message}`);
            })
            .finally(() => {
                return {
                    message: message,
                };
            });
    }

    async sendForgotPasswordMail(
        { userEmail, firstName, otpCode }: ForgotPasswordEmailDTO,
        transporter?: string,
    ) {
        const message = `Mail sent: ${userEmail}`;
        return await this.mailerService
            .sendMail({
                transporterName: this.resolveTransporter(transporter),
                to: userEmail,
                subject: 'Confirm your reset password',
                template: 'forgot-password',
                context: {
                    userEmail,
                    firstName,
                    otpCode,
                },
                attachments: [
                    {
                        filename: 'image-1.png',
                        path: join(this.TEMPLATES_PATH, 'images/image-1.png'),
                        cid: 'image1',
                    },
                ],
            })
            .then(() => {
                this.logger.log(`Mail sent: ${userEmail}`);
                return {
                    message: message,
                };
            })
            .catch((error) => {
                this.logger.error(`Send mail failed: ${error.message}`);
            })
            .finally(() => {
                return {
                    message: message,
                };
            });
    }

    private resolveTransporter(transporter = GMAIL_TRANSPORT) {
        const transporterName: string[] = [SENDGRID_TRANSPORT, GMAIL_TRANSPORT, RESEND_TRANSPORT];
        if (!transporterName.includes(transporter)) {
            transporter = GMAIL_TRANSPORT;
        }

        return transporter;
    }
}
