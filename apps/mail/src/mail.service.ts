import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RpcException } from '@nestjs/microservices';
import { ConfirmEmailRegisterDTO, ForgotPasswordEmailDTO } from './dtos';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendMail(email: string, name: string) {
        return await this.mailerService
            .sendMail({
                to: email,
                subject: 'Greeting from NestJS NodeMailer',
                template: './test',
                context: {
                    name: name,
                },
            })
            .then(() => {
                Logger.log(`Mail sent:: ${email}`);
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
                template: './confirm-register',
                context: emailContext,
            })
            .then(() => {
                Logger.log(`Mail sent: ${email}`);
                return {
                    message: message,
                };
            })
            .catch((error) => {
                Logger.error(`Send mail failed: ${error.message}`);
            })
            .finally(() => {
                return {
                    message: message,
                };
            });
    }

    async sendForgotPasswordMail({
        userEmail,
        firstName,
        verifyCode,
        expMinutes,
    }: ForgotPasswordEmailDTO) {
        const message = `Mail sent: ${userEmail}`;
        return await this.mailerService
            .sendMail({
                to: userEmail,
                subject: 'Confirm your reset password',
                template: './forgot-password',
                context: {
                    userEmail,
                    firstName,
                    verifyCode,
                    expMinutes,
                },
                attachments: [
                    {
                        filename: 'image-1.png',
                        path: __dirname + '/templates/images/image-1.png',
                        cid: 'image1',
                    },
                ],
            })
            .then(() => {
                Logger.log(`Mail sent: ${userEmail}`);
                return {
                    message: message,
                };
            })
            .catch((error) => {
                Logger.error(`Send mail failed: ${error.message}`);
            })
            .finally(() => {
                return {
                    message: message,
                };
            });
    }
}
