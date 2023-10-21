import { join } from 'path';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TTransport } from './interfaces';

export class MailerConfig implements MailerOptionsFactory {
    private readonly DEFAULT_SENDER = process.env.MAIL_SENDER ?? '<teams@techcell.cloud>';

    public readonly SendGridTransport: TTransport = {
        host: process.env.SENDGRID_HOST ?? 'smtp.sendgrid.net',
        secure: true,
        auth: {
            user: process.env.SENDGRID_USER ?? 'apikey',
            pass: process.env.SENDGRID_PASSWORD,
        },
    };

    public readonly ResendTransport: TTransport = {
        host: process.env.RESEND_HOST ?? 'smtp.resend.com',
        secure: true,
        auth: {
            user: process.env.RESEND_USER ?? 'resend',
            pass: process.env.RESEND_API_KEY,
        },
    };

    public readonly GmailTransport: TTransport = {
        host: process.env.GMAIL_HOST ?? 'smtp.gmail.com',
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
    };

    public buildMailerOptions(transport: TTransport) {
        return {
            transport,
            defaults: {
                from: this.DEFAULT_SENDER,
            },
            template: {
                dir: join(__dirname, `mail/templates`),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    }

    createMailerOptions() {
        return this.buildMailerOptions(this.GmailTransport);
    }
}
