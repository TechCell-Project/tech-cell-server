import { Module } from '@nestjs/common';
import { ProductsSearchModule } from './products-search/products-search.module';
import { AttributesSearchModule } from './attributes-search/attributes-search.module';
import { CategoriesSearchModule } from './categories-search/categories-search.module';

@Module({
    imports: [ProductsSearchModule, AttributesSearchModule, CategoriesSearchModule],
})
export class SearchModule {}
