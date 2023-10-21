import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RpcException } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { GMAIL_TRANS, RESEND_TRANS, SENDGRID_TRANS } from './constants';
import { MailerConfig } from './mail.config';
import { join } from 'path';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    private readonly logger = new Logger(MailService.name);
    private readonly TEMPLATES_PATH = join(__dirname, 'mail/templates');

    setTransport() {
        const config = new MailerConfig();
        this.mailerService.addTransporter(SENDGRID_TRANS, config.SendGridTransport);
        this.mailerService.addTransporter(RESEND_TRANS, config.ResendTransport);
        this.mailerService.addTransporter(GMAIL_TRANS, config.GmailTransport);
    }

    async sendMail(email: string, name: string) {
        this.setTransport();
        return await this.mailerService
            .sendMail({
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

    async sendConfirmMail(email: string, emailContext: ConfirmEmailRegisterDTO) {
        const message = `Mail sent: ${email}`;
        return await this.mailerService
            .sendMail({
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

    async sendForgotPasswordMail({ userEmail, firstName, otpCode }: ForgotPasswordEmailDTO) {
        const message = `Mail sent: ${userEmail}`;
        return await this.mailerService
            .sendMail({
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
}
