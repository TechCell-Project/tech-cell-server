import { Module } from '@nestjs/common';
import { ProductsSearchModule } from './products-search/products-search.module';
import { AttributesSearchModule } from './attributes-search/attributes-search.module';

@Module({
    imports: [ProductsSearchModule, AttributesSearchModule],
})
export class SearchModule {}
