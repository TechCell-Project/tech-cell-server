import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    getHello(): string {
        return 'Hello World!';
    }

    async sendMail(email: string, name: string) {
        console.log(email);
        console.log(name);
        return await this.mailerService
            .sendMail({
                to: email,
                subject: 'Greeting from NestJS NodeMailer',
                template: './confirm',
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
}
