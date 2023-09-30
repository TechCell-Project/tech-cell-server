import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { ProductsSearchModule } from './products-search/products-search.module';
import { AttributesSearchModule } from './attributes-search/attributes-search.module';
import { CategoriesSearchModule } from './categories-search/categories-search.module';
import { UsersSearchModule } from './users-search/users-search.module';

@Module({
    imports: [
        AppConfigModule,
        UsersSearchModule,
        ProductsSearchModule,
        AttributesSearchModule,
        CategoriesSearchModule,
    ],
})
export class SearchModule {}
