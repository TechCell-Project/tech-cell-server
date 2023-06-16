import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export class MailerConfig implements MailerOptionsFactory {
    createMailerOptions() {
        const sendgridTransport = {
            host: process.env.EMAIL_HOST,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        };

        const gmailTransport = {
            host: process.env.GMAIL_HOST,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        };

        return {
            transport: sendgridTransport,
            fallbackTransport: gmailTransport,
            defaults: {
                from: 'TechCell Teams <teams@techcell.cloud>',
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    }
}
