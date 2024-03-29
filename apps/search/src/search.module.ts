import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common/appConfig';
import { ProductsSearchModule } from './products-search/products-search.module';
import { AttributesSearchModule } from './attributes-search/attributes-search.module';
import { CategoriesSearchModule } from './categories-search/categories-search.module';
import { UsersSearchModule } from './users-search/users-search.module';
import { AddressSearchModule } from './address-search';
import { SearchController } from './search.controller';
import { SearchHealthIndicator } from './search.health';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { I18nModule } from '~libs/common/i18n/i18n.module';

@Module({
    imports: [
        AppConfigModule,
        I18nModule,
        UsersSearchModule,
        ProductsSearchModule,
        AttributesSearchModule,
        CategoriesSearchModule,
        AddressSearchModule,
    ],
    controllers: [SearchController],
    providers: [SearchHealthIndicator, RabbitMQService],
})
export class SearchModule {}
