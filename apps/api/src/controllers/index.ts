export * from './app.controller';
export * from './products.controller';
export * from './app.controller';

import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AuthController } from './auth.controller';
import { ManagamentsController } from './managaments.controller';

export default [AppController, ProductsController, AuthController, ManagamentsController];
