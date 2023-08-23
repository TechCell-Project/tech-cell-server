import { Module } from '@nestjs/common';
import { ProductsSearchModule } from './products-search/products-search.module';
import { AttributesSearchModule } from './attributes-search/attributes-search.module';
import { CategoriesSearchModule } from './categories-search/categories-search.module';
import { AppConfigModule } from '@app/common';

@Module({
    imports: [
        AppConfigModule,
        ProductsSearchModule,
        AttributesSearchModule,
        CategoriesSearchModule,
    ],
})
export class SearchModule {}
