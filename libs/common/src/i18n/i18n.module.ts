import { Module } from '@nestjs/common';
import * as path from 'path';
import {
    I18nModule as I18nModuleCore,
    AcceptLanguageResolver,
    HeaderResolver,
    QueryResolver,
    I18nContext,
} from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { RabbitMQHeaderResolver, SocketHeaderResolver } from './resolvers';

@Module({
    imports: [
        I18nModuleCore.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
                loaderOptions: {
                    path: path.join(__dirname, '../../../libs/common/src/i18n/lang/'),
                    watch: true,
                },
                typesOutputPath: path.join(
                    __dirname,
                    '../../../libs/common/src/i18n/generated/i18n.generated.ts',
                ),
            }),
            resolvers: [
                new SocketHeaderResolver(['x-lang', 'lang', 'x-language']),
                new RabbitMQHeaderResolver(['x-lang', 'lang', 'x-language']),
                { use: QueryResolver, options: ['lang', 'language'] },
                new HeaderResolver(['x-lang', 'lang', 'x-language']),
                AcceptLanguageResolver, // must be the last one
            ],
            inject: [ConfigService],
        }),
    ],
    providers: [I18nContext],
    exports: [I18nContext],
})
export class I18nModule {}
