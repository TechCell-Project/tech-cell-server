import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
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
    private readonly TRANSPORTERS = [GMAIL_TRANSPORT, SENDGRID_TRANSPORT, RESEND_TRANSPORT];
    private readonly MAX_RETRIES = this.TRANSPORTERS.length;

    async sendMail(email: string, name: string, transporter?: string, retryCount = 0) {
        if (retryCount > this.MAX_RETRIES) {
            this.logger.error(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        const transporterName = this.resolveTransporter(transporter);
        return await this.mailerService
            .sendMail({
                transporterName,
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
            .catch(async (error) => {
                this.logger.error(`Send mail failed: ${error.message}`);

                transporter = this.getNextTransporter(transporterName);
                this.logger.log(`Retry send mail with transporter: ${transporter}`);
                return await this.sendMail(email, name, transporter, retryCount + 1);
            });
    }

    async sendConfirmMail(
        email: string,
        emailContext: ConfirmEmailRegisterDTO,
        transporter?: string,
        retryCount = 0,
    ) {
        if (retryCount > this.MAX_RETRIES) {
            this.logger.error(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        const transporterName = this.resolveTransporter(transporter);
        const message = `Mail sent: ${email}`;
        return await this.mailerService
            .sendMail({
                transporterName,
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
            .catch(async (error) => {
                this.logger.error(`Send mail failed: ${error.message}`);

                transporter = this.getNextTransporter(transporterName);
                this.logger.log(`Retry send mail with transporter: ${transporter}`);
                return await this.sendConfirmMail(email, emailContext, transporter, retryCount + 1);
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
        retryCount = 0,
    ) {
        if (retryCount > this.MAX_RETRIES) {
            this.logger.error(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        const transporterName = this.resolveTransporter(transporter);
        const message = `Mail sent: ${userEmail}`;
        return await this.mailerService
            .sendMail({
                transporterName,
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
            .catch(async (error) => {
                this.logger.error(`Send mail failed: ${error.message}`);

                transporter = this.getNextTransporter(transporterName);
                this.logger.log(`Retry send mail with transporter: ${transporter}`);
                return await this.sendForgotPasswordMail(
                    { userEmail, firstName, otpCode },
                    transporter,
                    retryCount + 1,
                );
            })
            .finally(() => {
                return {
                    message: message,
                };
            });
    }

    private resolveTransporter(transporter = GMAIL_TRANSPORT) {
        if (!this.TRANSPORTERS.includes(transporter)) {
            transporter = GMAIL_TRANSPORT;
        }

        return transporter;
    }

    private getNextTransporter(currentTransporter: string): string | null {
        const currentIndex = this.TRANSPORTERS.indexOf(currentTransporter);
        if (currentIndex === -1 || currentIndex === this.TRANSPORTERS.length - 1) {
            return this.TRANSPORTERS[0];
        } else {
            return this.TRANSPORTERS[currentIndex + 1];
        }
    }
}
