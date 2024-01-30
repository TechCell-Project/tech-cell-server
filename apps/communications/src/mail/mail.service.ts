import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';
import { GMAIL_TRANSPORT, RESEND_TRANSPORT, SENDGRID_TRANSPORT } from './constants';
import { MailerConfig } from './mail.config';
import { join } from 'path';
import { I18n, I18nService, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated';
import { SupportedLanguage } from '~libs/common/i18n';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @I18n() private readonly i18n: I18nService<I18nTranslations>,
    ) {
        const mailConfig = new MailerConfig();
        this.mailerService.addTransporter(SENDGRID_TRANSPORT, mailConfig.SendGridTransport);
        this.mailerService.addTransporter(RESEND_TRANSPORT, mailConfig.ResendTransport);
        this.mailerService.addTransporter(GMAIL_TRANSPORT, mailConfig.GmailTransport);
    }

    private readonly logger = new Logger(MailService.name);
    private readonly TEMPLATES_PATH = join(__dirname, 'mail/templates');
    private readonly TRANSPORTERS = [SENDGRID_TRANSPORT, RESEND_TRANSPORT, GMAIL_TRANSPORT];
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
        lang: SupportedLanguage,
        transporter?: string,
        retryCount = 0,
    ) {
        const i18Context = new I18nContext(lang, this.i18n);
        if (retryCount > this.MAX_RETRIES) {
            this.logger.debug(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        const transporterName = this.resolveTransporter(transporter);
        const message = `Mail sent: ${email}`;
        this.logger.debug(`Sending confirm mail to ${email} with transporter: ${transporterName}`);
        this.logger.log(emailContext);
        return this.mailerService
            .sendMail({
                transporterName,
                to: email,
                subject: i18Context.t('emailMessage.REGISTRATION_SUBJECT'),
                template: 'confirm-register',
                context: {
                    VERIFY_ACCOUNT_TEXT_1: i18Context.t('emailMessage.VERIFY_ACCOUNT_TEXT_1'),
                    YOUR_OTP_CODE_TEXT: i18Context.t('emailMessage.YOUR_OTP_CODE_TEXT'),
                    EXPIRED_TIME_OTP_TEXT: i18Context.t('emailMessage.EXPIRED_TIME_OTP_TEXT', {
                        args: {
                            time: '5',
                        },
                    }),
                    INSTRUCTIONS: i18Context.t('emailMessage.INSTRUCTIONS'),
                    INSTRUCTIONS_TEXT_ENTER_OTP_VERIFY_ACCOUNT: i18Context.t(
                        'emailMessage.INSTRUCTIONS_TEXT_ENTER_OTP_VERIFY_ACCOUNT',
                    ),
                    EMAIL_CREDIT: i18Context.t('emailMessage.EMAIL_CREDIT'),
                    otpCode: emailContext.otpCode,
                },
                attachments: [
                    {
                        filename: 'logo-red.png',
                        path: join(this.TEMPLATES_PATH, 'images/logo-red.png'),
                        cid: 'logo_red',
                    },
                ],
            })
            .then(() => {
                this.logger.debug(`Mail sent: ${email}`);
                return {
                    message: message,
                };
            })
            .catch(async (error) => {
                this.logger.debug(`Send mail failed: ${error.message}`);
                transporter = this.getNextTransporter(transporterName);
                this.logger.debug(`Retry send mail with transporter: ${transporter}`);
                return await this.sendConfirmMail(
                    email,
                    emailContext,
                    lang,
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

    async sendForgotPasswordMail(
        { userEmail, firstName, otpCode }: ForgotPasswordEmailDTO,
        lang,
        transporter?: string,
        retryCount = 0,
    ) {
        const i18Context = new I18nContext(lang, this.i18n);
        if (retryCount > this.MAX_RETRIES) {
            this.logger.debug(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        const transporterName = this.resolveTransporter(transporter);
        const message = `Mail sent: ${userEmail}`;
        this.logger.debug(
            `Sending forgot password mail to ${userEmail} with transporter: ${transporterName}`,
        );
        return this.mailerService
            .sendMail({
                transporterName,
                to: userEmail,
                subject: i18Context.t('emailMessage.RESET_PASSWORD_SUBJECT'),
                template: 'forgot-password',
                context: {
                    userEmail,
                    firstName,
                    otpCode,
                    FORGOT_PASSWORD_TEXT_1: i18Context.t('emailMessage.FORGOT_PASSWORD_TEXT_1'),
                    YOUR_OTP_CODE_TEXT: i18Context.t('emailMessage.YOUR_OTP_CODE_TEXT'),
                    EXPIRED_TIME_OTP_TEXT: i18Context.t('emailMessage.EXPIRED_TIME_OTP_TEXT', {
                        args: {
                            time: '5',
                        },
                    }),
                    INSTRUCTIONS: i18Context.t('emailMessage.INSTRUCTIONS'),
                    INSTRUCTIONS_TEXT_ENTER_OTP_RESET_PASSWORD: i18Context.t(
                        'emailMessage.INSTRUCTIONS_TEXT_ENTER_OTP_RESET_PASSWORD',
                    ),
                    EMAIL_CREDIT: i18Context.t('emailMessage.EMAIL_CREDIT'),
                },
                attachments: [
                    {
                        filename: 'logo-red.png',
                        path: join(this.TEMPLATES_PATH, 'images/logo-red.png'),
                        cid: 'logo_red',
                    },
                ],
            })
            .then(() => {
                this.logger.debug(`Mail sent: ${userEmail}`);
                return {
                    message: message,
                };
            })
            .catch(async (error) => {
                this.logger.debug(`Send mail failed: ${error.message}`);
                transporter = this.getNextTransporter(transporterName);
                this.logger.debug(`Retry send mail with transporter: ${transporter}`);
                return await this.sendForgotPasswordMail(
                    { userEmail, firstName, otpCode },
                    lang,
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

    private resolveTransporter(transporter = SENDGRID_TRANSPORT) {
        if (!this.TRANSPORTERS.includes(transporter)) {
            transporter = SENDGRID_TRANSPORT;
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
