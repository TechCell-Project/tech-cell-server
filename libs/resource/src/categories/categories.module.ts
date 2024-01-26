import { Module } from '@nestjs/common';
import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ],
    providers: [CategoriesService, CategoriesRepository],
    exports: [CategoriesService],
})
export class CategoriesModule {}
